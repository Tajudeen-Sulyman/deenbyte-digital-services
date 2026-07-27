const asyncHandler = require('../../utils/asyncHandler');
const { success, ApiError } = require('../../utils/response');
const env = require('../../config/env');
const authService = require('./auth.service');

const REFRESH_COOKIE_NAME = 'deenbyte_refresh_token';

function setRefreshCookie(res, token, rememberMe) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth'
  });
}

const registerHandler = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  return success(res, 201, 'Registration successful. Please check your email to verify your account.', {
    id: user.id,
    email: user.email
  });
});

const verifyEmailHandler = asyncHandler(async (req, res) => {
  const { token } = req.body;
  await authService.verifyEmail(token);
  return success(res, 200, 'Email verified successfully. You can now log in.');
});

const loginHandler = asyncHandler(async (req, res) => {
  const { user, tokens } = await authService.login(req.body);
  setRefreshCookie(res, tokens.refreshToken, req.body.rememberMe);

  return success(res, 200, 'Login successful.', {
    accessToken: tokens.accessToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      firstName: user.profile?.firstName,
      lastName: user.profile?.lastName
    }
  });
});

const refreshHandler = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!token) throw new ApiError(401, 'No refresh token provided. Please log in again.');
  const { accessToken } = await authService.refreshAccessToken(token);
  return success(res, 200, 'Token refreshed.', { accessToken });
});

const logoutHandler = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (token) await authService.logout(token);
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
  return success(res, 200, 'Logged out successfully.');
});

const forgotPasswordHandler = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  return success(res, 200, 'If an account exists for this email, a reset link has been sent.');
});

const resetPasswordHandler = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  return success(res, 200, 'Password reset successful. Please log in with your new password.');
});

const changePasswordHandler = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user.id, req.body);
  return success(res, 200, 'Password changed successfully.');
});

module.exports = {
  registerHandler,
  verifyEmailHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  changePasswordHandler,
  REFRESH_COOKIE_NAME
};
