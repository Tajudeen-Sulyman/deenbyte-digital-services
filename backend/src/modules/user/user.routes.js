const express = require('express');
const { authenticate } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { updateProfileSchema } = require('./user.validators');
const { uploadAvatar } = require('./upload');
const controller = require('./user.controller');

const router = express.Router();
router.use(authenticate);

/**
 * @openapi
 * /users/me:
 *   get:
 *     tags: [User]
 *     summary: Get authenticated user's full profile
 *     security: [{ bearerAuth: [] }]
 */
router.get('/me', controller.getMeHandler);

/**
 * @openapi
 * /users/me:
 *   patch:
 *     tags: [User]
 *     summary: Update authenticated user's profile
 *     security: [{ bearerAuth: [] }]
 */
router.patch('/me', validate(updateProfileSchema), controller.updateProfileHandler);

/**
 * @openapi
 * /users/me/avatar:
 *   post:
 *     tags: [User]
 *     summary: Upload/update avatar image
 *     security: [{ bearerAuth: [] }]
 */
router.post('/me/avatar', uploadAvatar.single('avatar'), controller.uploadAvatarHandler);

module.exports = router;
