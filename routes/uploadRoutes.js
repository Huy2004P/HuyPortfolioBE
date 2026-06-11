const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');
const { Readable } = require('stream');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Memory storage for images so we can process them using sharp
const imageMemoryStorage = multer.memoryStorage();
const uploadImageMemory = multer({
  storage: imageMemoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit for images
});

// Storage for APK files (Cloudinary - raw resource type, direct upload)
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
const uploadApk = multer({
  storage: apkStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for APKs
});

// POST /api/upload — upload and compress image to WebP (Admin only)
router.post('/', protect, uploadImageMemory.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Process image buffer using sharp (convert to WebP and compress)
    const webpBuffer = await sharp(req.file.buffer)
      .webp({ quality: 80 })
      .toBuffer();

    // Convert buffer to stream for Cloudinary
    const bufferStream = new Readable();
    bufferStream.push(webpBuffer);
    bufferStream.push(null);

    // Upload to Cloudinary using upload_stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'portfolio_image',
        format: 'webp',
        public_id: `img-${Date.now()}-${Math.round(Math.random() * 1e5)}`
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload stream error:', error);
          return res.status(500).json({ message: 'Cloudinary upload failed', error });
        }
        res.json({ imageUrl: result.secure_url });
      }
    );

    bufferStream.pipe(uploadStream);
  } catch (err) {
    console.error('Image processing error:', err);
    res.status(500).json({ message: 'Image optimization failed', error: err.message });
  }
});

// POST /api/upload/apk — upload APK (Admin only)
router.post('/apk', protect, uploadApk.single('apk'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No APK file uploaded' });
  }
  res.json({ apkUrl: req.file.path });
});

module.exports = router;
