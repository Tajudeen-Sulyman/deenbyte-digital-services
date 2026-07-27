const express = require('express');
const validate = require('../../middleware/validate');
const { authenticate } = require('../../middleware/auth');
const { authLimiter } = require('../../middleware/rateLimiter');
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema
} = require('./auth.validators');
const controller = require('./auth.controller');

const router = express.Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new customer account
 */
router.post('/register', authLimiter, validate(registerSchema), controller.registerHandler);

/**
 * @openapi
 * /auth/verify-email:
 *   post:
 *     tags: [Auth]
 *     summary: Verify email using token sent via email
 */
router.post('/verify-email', controller.verifyEmailHandler);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in and receive access token (refresh token set as httpOnly cookie)
 */
router.post('/login', authLimiter, validate(loginSchema), controller.loginHandler);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Exchange refresh token cookie for a new access token
 */
router.post('/refresh', controller.refreshHandler);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Log out and revoke refresh token
 */
router.post('/logout', controller.logoutHandler);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request a password reset link
 */
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), controller.forgotPasswordHandler);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password using token
 */
router.post('/reset-password', validate(resetPasswordSchema), controller.resetPasswordHandler);

/**
 * @openapi
 * /auth/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Change password while authenticated
 *     security: [{ bearerAuth: [] }]
 */
router.post('/change-password', authenticate, validate(changePasswordSchema), controller.changePasswordHandler);

module.exports = router;
