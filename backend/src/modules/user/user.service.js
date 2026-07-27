const prisma = require('../../config/db');
const { ApiError } = require('../../utils/response');

async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true, wallet: true }
  });
  if (!user) throw new ApiError(404, 'User not found.');
  const { passwordHash, emailVerifyToken, passwordResetToken, ...safe } = user;
  return safe;
}

async function updateProfile(userId, data) {
  const payload = { ...data };
  if (payload.dateOfBirth === '') delete payload.dateOfBirth;
  if (payload.dateOfBirth) payload.dateOfBirth = new Date(payload.dateOfBirth);

  const profile = await prisma.profile.upsert({
    where: { userId },
    update: payload,
    create: { userId, ...payload }
  });
  return profile;
}

async function updateAvatar(userId, avatarUrl) {
  return prisma.profile.upsert({
    where: { userId },
    update: { avatarUrl },
    create: { userId, avatarUrl }
  });
}

module.exports = { getMe, updateProfile, updateAvatar };
