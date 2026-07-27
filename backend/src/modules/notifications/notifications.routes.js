const express = require('express');
const { authenticate } = require('../../middleware/auth');
const controller = require('./notifications.controller');

const router = express.Router();
router.use(authenticate);

/**
 * @openapi
 * /notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: List notifications for the authenticated user
 *     security: [{ bearerAuth: [] }]
 */
router.get('/', controller.listHandler);

/**
 * @openapi
 * /notifications/{id}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark a notification as read
 *     security: [{ bearerAuth: [] }]
 */
router.patch('/:id/read', controller.markReadHandler);

module.exports = router;
