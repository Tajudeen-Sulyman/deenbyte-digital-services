const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/response');
const servicesService = require('./services.service');

const listServicesHandler = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const services = await servicesService.listServices(category);
  return success(res, 200, 'Services retrieved.', services);
});

const getServiceHandler = asyncHandler(async (req, res) => {
  const service = await servicesService.getServiceByCode(req.params.code);
  return success(res, 200, 'Service retrieved.', service);
});

const purchaseHandler = asyncHandler(async (req, res) => {
  const result = await servicesService.purchaseService(req.user.id, req.body);
  return success(res, 201, 'Purchase successful.', result);
});

const receiptHandler = asyncHandler(async (req, res) => {
  const order = await servicesService.getOrderReceipt(req.user.id, req.params.orderId);
  return success(res, 200, 'Receipt retrieved.', order);
});

const historyHandler = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, category, status } = req.query;
  const result = await servicesService.getOrderHistory(req.user.id, {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    category,
    status
  });
  return success(res, 200, 'Order history retrieved.', result.items, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages
  });
});

module.exports = { listServicesHandler, getServiceHandler, purchaseHandler, receiptHandler, historyHandler };
