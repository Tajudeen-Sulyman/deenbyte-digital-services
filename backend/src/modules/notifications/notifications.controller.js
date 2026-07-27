const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/response');
const notificationsService = require('./notifications.service');

const listHandler = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const result = await notificationsService.listForUser(req.user.id, {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10)
  });
  return success(res, 200, 'Notifications retrieved.', result.items, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
    unreadCount: result.unreadCount
  });
});

const markReadHandler = asyncHandler(async (req, res) => {
  const notification = await notificationsService.markAsRead(req.user.id, req.params.id);
  return success(res, 200, 'Notification marked as read.', notification);
});

module.exports = { listHandler, markReadHandler };
