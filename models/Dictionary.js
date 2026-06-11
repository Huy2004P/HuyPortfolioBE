const mongoose = require('mongoose');
const { translateMap } = require('../utils/translator');

const dictionarySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  translations: { type: Map, of: String, default: {} } // e.g., { vi: "Trang chủ", en: "Home", ja: "ホーム" }
}, {
  timestamps: true
});

dictionarySchema.pre('save', async function() {
  if (this.isModified('translations')) {
    this.translations = await translateMap(this.translations);
  }
});

module.exports = mongoose.model('Dictionary', dictionarySchema);
