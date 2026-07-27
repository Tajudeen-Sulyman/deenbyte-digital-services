const asyncHandler = require('../../utils/asyncHandler');
const { success, ApiError } = require('../../utils/response');
const userService = require('./user.service');

const getMeHandler = asyncHandler(async (req, res) => {
  const user = await userService.getMe(req.user.id);
  return success(res, 200, 'Profile retrieved.', user);
});

const updateProfileHandler = asyncHandler(async (req, res) => {
  const profile = await userService.updateProfile(req.user.id, req.body);
  return success(res, 200, 'Profile updated successfully.', profile);
});

const uploadAvatarHandler = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(422, 'No file uploaded.');
  const avatarUrl = `/uploads/avatars/${req.file.filename}`;
  const profile = await userService.updateAvatar(req.user.id, avatarUrl);
  return success(res, 200, 'Avatar updated successfully.', profile);
});

module.exports = { getMeHandler, updateProfileHandler, uploadAvatarHandler };
