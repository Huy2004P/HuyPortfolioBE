const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for images (Cloudinary)
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'portfolio_image',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif']
  },
});

// Storage for APK files (Cloudinary - raw resource type)
const apkStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'portfolio_apk',
    resource_type: 'raw',
    allowed_formats: ['apk'],
    use_filename: true,
    unique_filename: true,
  },
});

const uploadImage = multer({ storage: imageStorage });
const uploadApk = multer({
  storage: apkStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

// POST /api/upload — upload image
router.post('/', protect, uploadImage.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ imageUrl: req.file.path });
});

// POST /api/upload/apk — upload APK
router.post('/apk', protect, uploadApk.single('apk'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No APK file uploaded' });
  }
  res.json({ apkUrl: req.file.path });
});

module.exports = router;
