const fs = require('node:fs');
const multer = require('multer');

if (!fs.existsSync('data/uploads')) {
  fs.mkdirSync('data/uploads', { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, './data/uploads');
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}--${file.originalname}`);
  },
});

const supportedTypes = [
  'jpg',
  'jpeg',
  'png',
  'svg',
  'svg+xml',
  'x-icon',
  'webp',
];

const fileFilter = (_req, file, cb) => {
  if (supportedTypes.includes(file.mimetype.split('/')[1])) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload.single('icon');
