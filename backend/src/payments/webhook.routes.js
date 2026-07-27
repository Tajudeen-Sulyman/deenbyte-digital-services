const express = require('express');
const { getProviderByName } = require('./PaymentFactory');
const walletService = require('../modules/wallet/wallet.service');
const logger = require('../config/logger');

const router = express.Router();

/**
 * Webhook endpoints per provider. Each verifies its own signature via the adapter's webhook() method.
 * Registered with express.raw() in app.js so the signature check gets the untouched request body.
 *
 * @openapi
 * /payments/webhook/{provider}:
 *   post:
 *     tags: [Payments]
 *     summary: Receive asynchronous payment notifications from a specific gateway
 */
router.post('/webhook/:provider', async (req, res) => {
  const { provider } = req.params;

  try {
    const adapter = getProviderByName(provider);
    const result = await adapter.webhook(req.body, req.headers);

    if (!result) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    if (result.status === 'success') {
      await walletService.confirmFunding(result.reference).catch((err) => {
        // Already credited or verification pending is not a webhook failure
        logger.warn(`Webhook confirmFunding note for ${result.reference}: ${err.message}`);
      });
    }

    return res.status(200).json({ success: true, message: 'Webhook received' });
  } catch (err) {
    logger.error(`Webhook error for provider ${provider}: ${err.message}`);
    return res.status(400).json({ success: false, message: 'Webhook processing failed' });
  }
});

module.exports = router;
