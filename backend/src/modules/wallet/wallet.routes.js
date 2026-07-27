const express = require('express');
const { z } = require('zod');
const { authenticate } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const controller = require('./wallet.controller');

const router = express.Router();

const fundSchema = z.object({ amount: z.number().positive('Amount must be greater than zero') });
const confirmSchema = z.object({ reference: z.string().min(1) });

router.use(authenticate);

/**
 * @openapi
 * /wallet:
 *   get:
 *     tags: [Wallet]
 *     summary: Get current user's wallet balance
 *     security: [{ bearerAuth: [] }]
 */
router.get('/', controller.getWalletHandler);

/**
 * @openapi
 * /wallet/history:
 *   get:
 *     tags: [Wallet]
 *     summary: Get wallet transaction history
 *     security: [{ bearerAuth: [] }]
 */
router.get('/history', controller.getHistoryHandler);

/**
 * @openapi
 * /wallet/fund:
 *   post:
 *     tags: [Wallet]
 *     summary: Initialize wallet funding via the active payment provider
 *     security: [{ bearerAuth: [] }]
 */
router.post('/fund', validate(fundSchema), controller.fundWalletHandler);

/**
 * @openapi
 * /wallet/fund/confirm:
 *   post:
 *     tags: [Wallet]
 *     summary: Confirm and credit wallet after payment redirect
 *     security: [{ bearerAuth: [] }]
 */
router.post('/fund/confirm', validate(confirmSchema), controller.confirmFundingHandler);

module.exports = router;
