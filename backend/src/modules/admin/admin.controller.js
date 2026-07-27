const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/response');
const adminService = require('./admin.service');

const dashboardHandler = asyncHandler(async (req, res) => {
  const stats = await adminService.getDashboardStats();
  const revenueTrend = await adminService.getRevenueTrend(14);
  return success(res, 200, 'Dashboard stats retrieved.', { stats, revenueTrend });
});

const listUsersHandler = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role, isActive } = req.query;
  const result = await adminService.listUsers({ page: parseInt(page, 10), limit: parseInt(limit, 10), search, role, isActive });
  return success(res, 200, 'Users retrieved.', result.items, { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages });
});

const toggleUserHandler = asyncHandler(async (req, res) => {
  const user = await adminService.toggleUserActive(req.params.userId, req.body.isActive);
  return success(res, 200, 'User status updated.', user);
});

const listTransactionsHandler = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type, status } = req.query;
  const result = await adminService.listTransactions({ page: parseInt(page, 10), limit: parseInt(limit, 10), type, status });
  return success(res, 200, 'Transactions retrieved.', result.items, { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages });
});

const listWalletsHandler = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const result = await adminService.listWallets({ page: parseInt(page, 10), limit: parseInt(limit, 10) });
  return success(res, 200, 'Wallets retrieved.', result.items, { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages });
});

const toggleWalletLockHandler = asyncHandler(async (req, res) => {
  const wallet = await adminService.toggleWalletLock(req.params.userId, req.body.isLocked);
  return success(res, 200, 'Wallet lock status updated.', wallet);
});

const listServicesHandler = asyncHandler(async (req, res) => {
  const services = await adminService.listServices();
  return success(res, 200, 'Services retrieved.', services);
});

const updateServiceHandler = asyncHandler(async (req, res) => {
  const service = await adminService.updateService(req.params.id, req.body);
  return success(res, 200, 'Service updated.', service);
});

const createAnnouncementHandler = asyncHandler(async (req, res) => {
  const announcement = await adminService.createAnnouncement(req.body);
  return success(res, 201, 'Announcement broadcast to all users.', announcement);
});

const reportsHandler = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const reports = await adminService.getReports({ from, to });
  return success(res, 200, 'Reports generated.', reports);
});

module.exports = {
  dashboardHandler,
  listUsersHandler,
  toggleUserHandler,
  listTransactionsHandler,
  listWalletsHandler,
  toggleWalletLockHandler,
  listServicesHandler,
  updateServiceHandler,
  createAnnouncementHandler,
  reportsHandler
};
