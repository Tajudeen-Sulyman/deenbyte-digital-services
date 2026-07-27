const prisma = require('../../config/db');
const { ApiError } = require('../../utils/response');
const { generateReference } = require('../../utils/reference');
const { getServiceProvider } = require('./providerRegistry');
const walletService = require('../wallet/wallet.service');

async function listServices(category) {
  const where = { isActive: true };
  if (category) where.category = category;
  return prisma.service.findMany({ where, orderBy: { name: 'asc' } });
}

async function getServiceByCode(code) {
  const service = await prisma.service.findUnique({ where: { code } });
  if (!service || !service.isActive) throw new ApiError(404, 'Service not found or unavailable.');
  return service;
}

function computeFee(service, amount) {
  const flat = Number(service.feeFlat || 0);
  const percent = Number(service.feePercent || 0);
  return flat + (amount * percent) / 100;
}

/**
 * Validates against the service's field schema, computes total cost, checks bounds.
 * Each service on the platform (Airtime, Data, Electricity, Cable, NIN, BVN, CAC, WAEC, NECO, JAMB)
 * flows through this single, well-tested pipeline: validate -> deduct -> purchase -> receipt -> history.
 */
function validateInputAgainstSchema(service, inputPayload) {
  const schema = service.fieldsSchema?.fields || [];
  const errors = [];
  for (const field of schema) {
    if (field.required && (inputPayload[field.name] === undefined || inputPayload[field.name] === '')) {
      errors.push(`${field.label || field.name} is required.`);
    }
    if (field.type === 'select' && field.options && inputPayload[field.name]) {
      if (!field.options.includes(inputPayload[field.name])) {
        errors.push(`${field.label || field.name} must be one of: ${field.options.join(', ')}`);
      }
    }
  }
  if (errors.length) throw new ApiError(422, 'Validation failed', errors);
}

/**
 * Executes a full service purchase:
 *  1. Validate input against the service's field schema
 *  2. Resolve amount + fee, enforce min/max bounds
 *  3. Debit wallet (atomic, fails if insufficient balance)
 *  4. Create Order (PENDING -> PROCESSING)
 *  5. Dispatch to the correct provider adapter
 *  6. On success: mark order SUCCESS, attach token/providerRef -> this becomes the receipt
 *  7. On failure: mark order FAILED and reverse the wallet debit automatically
 */
async function purchaseService(userId, { serviceCode, inputPayload, amount: requestedAmount }) {
  const service = await getServiceByCode(serviceCode);
  validateInputAgainstSchema(service, inputPayload);

  const amount = requestedAmount ?? Number(inputPayload.amount) ?? 0;
  if (amount <= 0) throw new ApiError(422, 'A valid amount is required for this service.');

  if (service.minAmount && amount < Number(service.minAmount)) {
    throw new ApiError(422, `Minimum amount for this service is ${service.minAmount}.`);
  }
  if (service.maxAmount && amount > Number(service.maxAmount)) {
    throw new ApiError(422, `Maximum amount for this service is ${service.maxAmount}.`);
  }

  const fee = computeFee(service, amount);
  const totalAmount = amount + fee;
  const reference = generateReference('ORD');

  // Step 1: create the pending order
  const order = await prisma.order.create({
    data: {
      reference,
      userId,
      serviceId: service.id,
      status: 'PENDING',
      amount,
      fee,
      totalAmount,
      inputPayload
    }
  });

  // Step 2: debit wallet up front (atomic + idempotent per order)
  let debitTx;
  try {
    debitTx = await walletService.debitWallet({
      userId,
      amount: totalAmount,
      description: `${service.name} purchase`,
      orderId: order.id,
      metadata: { serviceCode: service.code }
    });
  } catch (err) {
    await prisma.order.update({ where: { id: order.id }, data: { status: 'FAILED' } });
    throw err;
  }

  // Step 3: dispatch to the provider
  await prisma.order.update({ where: { id: order.id }, data: { status: 'PROCESSING' } });

  const provider = getServiceProvider(service.provider);
  const result = await provider.purchase(service, inputPayload, order);

  if (result.success) {
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'SUCCESS',
        providerResponse: result.raw,
        providerRef: result.providerRef,
        token: result.token
      }
    });
    return { order: updatedOrder, transaction: debitTx };
  }

  // Step 4: provider failed -> reverse the debit and mark order failed
  await prisma.order.update({
    where: { id: order.id },
    data: { status: 'FAILED', providerResponse: result.raw }
  });
  await walletService.reverseDebit({
    userId,
    amount: totalAmount,
    description: `Reversal: ${service.name} purchase failed`,
    orderId: order.id
  });

  throw new ApiError(502, `${service.name} purchase failed with the provider. Your wallet has been refunded.`, result.raw);
}

async function getOrderReceipt(userId, orderId) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { service: true, transaction: true }
  });
  if (!order) throw new ApiError(404, 'Order not found.');
  return order;
}

async function getOrderHistory(userId, { page = 1, limit = 20, category, status } = {}) {
  const where = { userId };
  if (status) where.status = status;
  if (category) where.service = { category };

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { service: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.order.count({ where })
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

module.exports = {
  listServices,
  getServiceByCode,
  purchaseService,
  getOrderReceipt,
  getOrderHistory
};
