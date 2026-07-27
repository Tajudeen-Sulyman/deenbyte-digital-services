const prisma = require('../../config/db');
const { ApiError } = require('../../utils/response');

async function listForUser(userId, { page = 1, limit = 20 } = {}) {
  const where = { OR: [{ userId }, { isBroadcast: true }] };
  const [items, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { ...where, isRead: false } })
  ]);
  return { items, total, unreadCount, page, limit, totalPages: Math.ceil(total / limit) };
}

async function markAsRead(userId, notificationId) {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, OR: [{ userId }, { isBroadcast: true }] }
  });
  if (!notification) throw new ApiError(404, 'Notification not found.');
  return prisma.notification.update({ where: { id: notificationId }, data: { isRead: true } });
}

async function create({ userId, title, message, type = 'INFO', isBroadcast = false }) {
  return prisma.notification.create({ data: { userId, title, message, type, isBroadcast } });
}

module.exports = { listForUser, markAsRead, create };
