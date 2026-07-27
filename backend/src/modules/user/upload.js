const multer = require('multer');
const path = require('path');
const fs = require('fs');
const env = require('../../config/env');
const { ApiError } = require('../../utils/response');

const avatarDir = path.join(process.cwd(), env.upload.dir, 'avatars');
fs.mkdirSync(avatarDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  }
});

function fileFilter(req, file, cb) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new ApiError(422, 'Only JPEG, PNG, or WEBP images are allowed.'));
  }
  cb(null, true);
}

const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.upload.maxMb * 1024 * 1024 }
});

module.exports = { uploadAvatar };
