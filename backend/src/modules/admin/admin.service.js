const prisma = require('../../config/db');
const { ApiError } = require('../../utils/response');
const notificationsService = require('../notifications/notifications.service');

async function getDashboardStats() {
  const [totalUsers, activeUsers, totalWalletBalance, totalOrders, successfulOrders, todayRevenue, pendingOrders] =
    await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.user.count({ where: { role: 'CUSTOMER', isActive: true } }),
      prisma.wallet.aggregate({ _sum: { balance: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'SUCCESS' } }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: 'SUCCESS', createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } }
      }),
      prisma.order.count({ where: { status: 'PENDING' } })
    ]);

  return {
    totalUsers,
    activeUsers,
    totalWalletBalance: totalWalletBalance._sum.balance || 0,
    totalOrders,
    successfulOrders,
    successRate: totalOrders > 0 ? ((successfulOrders / totalOrders) * 100).toFixed(1) : '0.0',
    todayRevenue: todayRevenue._sum.totalAmount || 0,
    pendingOrders
  };
}

async function getRevenueTrend(days = 14) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const orders = await prisma.order.findMany({
    where: { status: 'SUCCESS', createdAt: { gte: since } },
    select: { createdAt: true, totalAmount: true }
  });

  const buckets = {};
  for (const o of orders) {
    const key = o.createdAt.toISOString().slice(0, 10);
    buckets[key] = (buckets[key] || 0) + Number(o.totalAmount);
  }
  return buckets;
}

async function listUsers({ page = 1, limit = 20, search, role, isActive }) {
  const where = {};
  if (role) where.role = role;
  if (isActive !== undefined) where.isActive = isActive === 'true';
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } }
    ];
  }

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { profile: true, wallet: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.user.count({ where })
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

async function toggleUserActive(userId, isActive) {
  const user = await prisma.user.update({ where: { id: userId }, data: { isActive } });
  return user;
}

async function listTransactions({ page = 1, limit = 20, type, status }) {
  const where = {};
  if (type) where.type = type;
  if (status) where.status = status;

  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.transaction.count({ where })
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

async function listWallets({ page = 1, limit = 20 }) {
  const [items, total] = await Promise.all([
    prisma.wallet.findMany({
      include: { user: { select: { email: true } } },
      orderBy: { balance: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.wallet.count()
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

async function toggleWalletLock(userId, isLocked) {
  return prisma.wallet.update({ where: { userId }, data: { isLocked } });
}

async function listServices() {
  return prisma.service.findMany({ orderBy: { category: 'asc' } });
}

async function updateService(id, data) {
  return prisma.service.update({ where: { id }, data });
}

async function createAnnouncement({ title, message, type = 'INFO' }) {
  return notificationsService.create({ title, message, type, isBroadcast: true });
}

async function getReports({ from, to }) {
  const where = {};
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  const [byCategory, byStatus] = await Promise.all([
    prisma.order.groupBy({
      by: ['serviceId'],
      where: { ...where, status: 'SUCCESS' },
      _sum: { totalAmount: true },
      _count: true
    }),
    prisma.order.groupBy({ by: ['status'], where, _count: true })
  ]);

  const services = await prisma.service.findMany({
    where: { id: { in: byCategory.map((b) => b.serviceId) } }
  });
  const serviceMap = Object.fromEntries(services.map((s) => [s.id, s]));

  return {
    byService: byCategory.map((b) => ({
      service: serviceMap[b.serviceId]?.name || 'Unknown',
      category: serviceMap[b.serviceId]?.category,
      totalRevenue: b._sum.totalAmount || 0,
      orderCount: b._count
    })),
    byStatus: byStatus.map((s) => ({ status: s.status, count: s._count }))
  };
}

module.exports = {
  getDashboardStats,
  getRevenueTrend,
  listUsers,
  toggleUserActive,
  listTransactions,
  listWallets,
  toggleWalletLock,
  listServices,
  updateService,
  createAnnouncement,
  getReports
};
