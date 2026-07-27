const prisma = require('../../config/db');
const { ApiError } = require('../../utils/response');
const { generateReference } = require('../../utils/reference');
const { getPaymentProvider } = require('../../payments/PaymentFactory');

async function getWallet(userId) {
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) throw new ApiError(404, 'Wallet not found for this user.');
  return wallet;
}

async function getTransactionHistory(userId, { page = 1, limit = 20, type, status } = {}) {
  const where = { userId };
  if (type) where.type = type;
  if (status) where.status = status;

  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.transaction.count({ where })
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

/**
 * Initiates wallet funding via the currently active payment provider.
 */
async function initiateFunding(userId, amount, email) {
  if (amount <= 0) throw new ApiError(422, 'Amount must be greater than zero.');

  const reference = generateReference('FUND');
  const provider = getPaymentProvider();

  const result = await provider.initializePayment({
    amount,
    email,
    reference,
    metadata: { userId, purpose: 'wallet_funding' }
  });

  return { ...result, reference };
}

/**
 * Confirms funding after redirect/verification and credits the wallet.
 * Idempotent: if a transaction with this reference already succeeded, it is a no-op.
 */
async function confirmFunding(reference) {
  const provider = getPaymentProvider();
  const verification = await provider.verifyPayment(reference);

  const existing = await prisma.transaction.findUnique({ where: { reference } });
  if (existing && existing.status === 'SUCCESS') {
    return existing; // already credited
  }

  if (verification.status !== 'success') {
    if (existing) {
      await prisma.transaction.update({ where: { reference }, data: { status: 'FAILED' } });
    }
    throw new ApiError(400, 'Payment verification failed or is still pending.');
  }

  return creditWallet({
    userId: verification.raw?.metadata?.userId,
    amount: verification.amount,
    reference,
    description: 'Wallet funding',
    provider: 'active',
    providerRef: reference
  });
}

/**
 * Core ledger operation: credit wallet balance atomically and record transaction.
 */
async function creditWallet({ userId, amount, reference, description, provider, providerRef, metadata }) {
  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new ApiError(404, 'Wallet not found.');

    const balanceBefore = wallet.balance;
    const balanceAfter = Number(balanceBefore) + Number(amount);

    const updatedWallet = await tx.wallet.update({
      where: { userId },
      data: { balance: balanceAfter }
    });

    const transaction = await tx.transaction.upsert({
      where: { reference },
      update: { status: 'SUCCESS', balanceAfter },
      create: {
        reference,
        userId,
        walletId: updatedWallet.id,
        type: 'CREDIT',
        status: 'SUCCESS',
        amount,
        balanceBefore,
        balanceAfter,
        description: description || 'Wallet credit',
        provider,
        providerRef,
        metadata
      }
    });

    return transaction;
  });
}

/**
 * Core ledger operation: debit wallet balance atomically and record transaction.
 * Throws if insufficient balance. Used by the services module for purchases.
 */
async function debitWallet({ userId, amount, description, orderId, metadata }) {
  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new ApiError(404, 'Wallet not found.');
    if (wallet.isLocked) throw new ApiError(403, 'Your wallet is locked. Contact support.');

    const balanceBefore = Number(wallet.balance);
    if (balanceBefore < Number(amount)) {
      throw new ApiError(400, 'Insufficient wallet balance. Please fund your wallet.');
    }
    const balanceAfter = balanceBefore - Number(amount);

    const updatedWallet = await tx.wallet.update({
      where: { userId },
      data: { balance: balanceAfter }
    });

    const reference = generateReference('DBT');
    const transaction = await tx.transaction.create({
      data: {
        reference,
        userId,
        walletId: updatedWallet.id,
        type: 'DEBIT',
        status: 'SUCCESS',
        amount,
        balanceBefore,
        balanceAfter,
        description: description || 'Wallet debit',
        orderId,
        metadata
      }
    });

    return transaction;
  });
}

/**
 * Reverses a debit (used when a service purchase fails after wallet was debited).
 */
async function reverseDebit({ userId, amount, description, orderId }) {
  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({ where: { userId } });
    const balanceBefore = Number(wallet.balance);
    const balanceAfter = balanceBefore + Number(amount);

    await tx.wallet.update({ where: { userId }, data: { balance: balanceAfter } });

    const reference = generateReference('RVS');
    return tx.transaction.create({
      data: {
        reference,
        userId,
        walletId: wallet.id,
        type: 'CREDIT',
        status: 'REVERSED',
        amount,
        balanceBefore,
        balanceAfter,
        description: description || 'Transaction reversal',
        orderId
      }
    });
  });
}

module.exports = {
  getWallet,
  getTransactionHistory,
  initiateFunding,
  confirmFunding,
  creditWallet,
  debitWallet,
  reverseDebit
};
