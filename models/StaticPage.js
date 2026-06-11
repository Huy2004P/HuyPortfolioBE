const mongoose = require('mongoose');

const staticPageSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // 'privacy', 'terms', 'donation', etc.
  title: { type: Map, of: String, required: true }, // Localized title
  content: { type: Map, of: String, default: {} }, // Localized content
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }, // Dynamic content: QR codes, bank accs, etc.
  updatedAt: { type: Date, default: Date.now }
});

// Update updatedAt field before saving
staticPageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('StaticPage', staticPageSchema);
