const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },
  projectType: { type: String, enum: ['web', 'mobile'], default: 'web' },
  projectUrl: { type: String },   // web link hoặc Apetizo demo link
  demoUrl: { type: String },      // link demo (Apetizo cho mobile, trực tiếp cho web)
  apkUrl: { type: String },       // file APK upload (chỉ dành cho mobile)
  technologies: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Project', projectSchema);
