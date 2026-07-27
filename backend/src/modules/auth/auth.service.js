const prisma = require('../../config/db');
const env = require('../../config/env');
const { ApiError } = require('../../utils/response');
const { hashPassword, comparePassword } = require('../../utils/password');
const { signAccessToken, generateRefreshTokenValue, generateRandomToken } = require('../../utils/jwt');
const { sendMail, verificationEmailTemplate, resetPasswordEmailTemplate } = require('../../utils/mailer');

function msFromDuration(duration) {
  // supports formats like '15m', '7d', '30d', '1h'
  const match = /^(\d+)([smhd])$/.exec(duration);
  if (!match) return 15 * 60 * 1000;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
  return value * multipliers[unit];
}

async function issueTokens(user, rememberMe = false) {
  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshTokenValue = generateRefreshTokenValue();
  const expiresIn = rememberMe ? env.jwt.refreshExpiresRemember : env.jwt.refreshExpires;
  const expiresAt = new Date(Date.now() + msFromDuration(expiresIn));

  await prisma.refreshToken.create({
    data: { token: refreshTokenValue, userId: user.id, expiresAt }
  });

  return { accessToken, refreshToken: refreshTokenValue, refreshExpiresAt: expiresAt };
}

async function register({ firstName, lastName, email, phone, password }) {
  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } });
  if (existing) {
    throw new ApiError(409, 'An account with this email or phone number already exists.');
  }

  const passwordHash = await hashPassword(password);
  const emailVerifyToken = generateRandomToken();
  const emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const user = await prisma.user.create({
    data: {
      email,
      phone,
      passwordHash,
      emailVerifyToken,
      emailVerifyExpires,
      profile: { create: { firstName, lastName } },
      wallet: { create: { balance: 0 } }
    },
    include: { profile: true }
  });

  const verifyLink = `${env.clientUrl}/verify-email?token=${emailVerifyToken}`;
  await sendMail({
    to: user.email,
    subject: 'Verify your DeenByte account',
    html: verificationEmailTemplate(firstName, verifyLink)
  });

  return user;
}

async function verifyEmail(token) {
  const user = await prisma.user.findFirst({
    where: { emailVerifyToken: token, emailVerifyExpires: { gt: new Date() } }
  });
  if (!user) throw new ApiError(400, 'Invalid or expired verification link.');

  await prisma.user.update({
    where: { id: user.id },
    data: { isEmailVerified: true, emailVerifyToken: null, emailVerifyExpires: null }
  });

  return true;
}

async function login({ email, password, rememberMe }) {
  const user = await prisma.user.findUnique({ where: { email }, include: { profile: true } });
  if (!user) throw new ApiError(401, 'Invalid email or password.');

  const validPassword = await comparePassword(password, user.passwordHash);
  if (!validPassword) throw new ApiError(401, 'Invalid email or password.');

  if (!user.isActive) throw new ApiError(403, 'Your account has been deactivated. Contact support.');

  const tokens = await issueTokens(user, rememberMe);
  return { user, tokens };
}

async function refreshAccessToken(refreshTokenValue) {
  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshTokenValue } });
  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw new ApiError(401, 'Invalid or expired refresh token. Please log in again.');
  }

  const user = await prisma.user.findUnique({ where: { id: stored.userId } });
  if (!user || !user.isActive) throw new ApiError(401, 'Account not found or deactivated.');

  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  return { accessToken, user };
}

async function logout(refreshTokenValue) {
  await prisma.refreshToken.updateMany({
    where: { token: refreshTokenValue },
    data: { revoked: true }
  });
}

async function forgotPassword(email) {
  const user = await prisma.user.findUnique({ where: { email }, include: { profile: true } });
  // Do not reveal whether the email exists
  if (!user) return;

  const token = generateRandomToken();
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordResetToken: token, passwordResetExpires: expires }
  });

  const resetLink = `${env.clientUrl}/reset-password?token=${token}`;
  await sendMail({
    to: user.email,
    subject: 'Reset your DeenByte password',
    html: resetPasswordEmailTemplate(user.profile?.firstName, resetLink)
  });
}

async function resetPassword({ token, password }) {
  const user = await prisma.user.findFirst({
    where: { passwordResetToken: token, passwordResetExpires: { gt: new Date() } }
  });
  if (!user) throw new ApiError(400, 'Invalid or expired reset link.');

  const passwordHash = await hashPassword(password);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, passwordResetToken: null, passwordResetExpires: null }
  });

  await prisma.refreshToken.updateMany({ where: { userId: user.id }, data: { revoked: true } });
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const valid = await comparePassword(currentPassword, user.passwordHash);
  if (!valid) throw new ApiError(400, 'Current password is incorrect.');

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}

module.exports = {
  register,
  verifyEmail,
  login,
  refreshAccessToken,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  issueTokens
};
