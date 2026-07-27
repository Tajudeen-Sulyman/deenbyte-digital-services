const express = require('express');
const { authenticate } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { purchaseSchema } = require('./services.validators');
const controller = require('./services.controller');

const router = express.Router();
router.use(authenticate);

/**
 * @openapi
 * /services:
 *   get:
 *     tags: [Services]
 *     summary: List all active services (optionally filtered by category)
 *     security: [{ bearerAuth: [] }]
 */
router.get('/', controller.listServicesHandler);

/**
 * @openapi
 * /services/history:
 *   get:
 *     tags: [Services]
 *     summary: Get authenticated user's order history across all services
 *     security: [{ bearerAuth: [] }]
 */
router.get('/history', controller.historyHandler);

/**
 * @openapi
 * /services/{code}:
 *   get:
 *     tags: [Services]
 *     summary: Get a single service definition (drives the dynamic purchase form)
 *     security: [{ bearerAuth: [] }]
 */
router.get('/:code', controller.getServiceHandler);

/**
 * @openapi
 * /services/purchase:
 *   post:
 *     tags: [Services]
 *     summary: Purchase any service (Airtime, Data, Electricity, Cable, NIN, BVN, CAC, WAEC, NECO, JAMB)
 *     security: [{ bearerAuth: [] }]
 */
router.post('/purchase', validate(purchaseSchema), controller.purchaseHandler);

/**
 * @openapi
 * /services/receipt/{orderId}:
 *   get:
 *     tags: [Services]
 *     summary: Get the receipt for a completed order
 *     security: [{ bearerAuth: [] }]
 */
router.get('/receipt/:orderId', controller.receiptHandler);

module.exports = router;
