const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safe = Date.now() + '-' + Math.random().toString(36).slice(2, 8) + ext;
    cb(null, safe);
  },
});

const fileFilter = (_req, file, cb) => {
  const ok = /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype);
  cb(ok ? null : new Error('صيغة الملف غير مدعومة'), ok);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;
