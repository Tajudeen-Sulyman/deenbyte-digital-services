const express = require('express');
const { authenticate, authorize } = require('../../middleware/auth');
const controller = require('./admin.controller');

const router = express.Router();
router.use(authenticate, authorize('ADMIN'));

/**
 * @openapi
 * /admin/dashboard:
 *   get:
 *     tags: [Admin]
 *     summary: Get admin dashboard KPIs and revenue trend
 *     security: [{ bearerAuth: [] }]
 */
router.get('/dashboard', controller.dashboardHandler);

/**
 * @openapi
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List/search users
 *     security: [{ bearerAuth: [] }]
 */
router.get('/users', controller.listUsersHandler);

/**
 * @openapi
 * /admin/users/{userId}/status:
 *   patch:
 *     tags: [Admin]
 *     summary: Activate/deactivate a user account
 *     security: [{ bearerAuth: [] }]
 */
router.patch('/users/:userId/status', controller.toggleUserHandler);

/**
 * @openapi
 * /admin/transactions:
 *   get:
 *     tags: [Admin]
 *     summary: List all transactions platform-wide
 *     security: [{ bearerAuth: [] }]
 */
router.get('/transactions', controller.listTransactionsHandler);

/**
 * @openapi
 * /admin/wallets:
 *   get:
 *     tags: [Admin]
 *     summary: List all wallets
 *     security: [{ bearerAuth: [] }]
 */
router.get('/wallets', controller.listWalletsHandler);

/**
 * @openapi
 * /admin/wallets/{userId}/lock:
 *   patch:
 *     tags: [Admin]
 *     summary: Lock/unlock a user's wallet
 *     security: [{ bearerAuth: [] }]
 */
router.patch('/wallets/:userId/lock', controller.toggleWalletLockHandler);

/**
 * @openapi
 * /admin/services:
 *   get:
 *     tags: [Admin]
 *     summary: List all services (including inactive)
 *     security: [{ bearerAuth: [] }]
 */
router.get('/services', controller.listServicesHandler);

/**
 * @openapi
 * /admin/services/{id}:
 *   patch:
 *     tags: [Admin]
 *     summary: Update a service (pricing, fees, active status)
 *     security: [{ bearerAuth: [] }]
 */
router.patch('/services/:id', controller.updateServiceHandler);

/**
 * @openapi
 * /admin/announcements:
 *   post:
 *     tags: [Admin]
 *     summary: Broadcast an announcement notification to all users
 *     security: [{ bearerAuth: [] }]
 */
router.post('/announcements', controller.createAnnouncementHandler);

/**
 * @openapi
 * /admin/reports:
 *   get:
 *     tags: [Admin]
 *     summary: Revenue and order reports grouped by service and status
 *     security: [{ bearerAuth: [] }]
 */
router.get('/reports', controller.reportsHandler);

module.exports = router;
