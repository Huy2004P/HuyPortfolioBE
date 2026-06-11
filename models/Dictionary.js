const mongoose = require('mongoose');
const { translateMap } = require('../utils/translator');

const dictionarySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  translations: { type: Map, of: String, default: {} } // e.g., { vi: "Trang chủ", en: "Home", ja: "ホーム" }
}, {
  timestamps: true
});

dictionarySchema.pre('save', async function() {
  const oldDoc = this.isNew ? null : await this.constructor.findById(this._id);
  const oldTranslations = oldDoc ? oldDoc.translations : null;

  if (this.isModified('translations')) {
    this.translations = await translateMap(this.translations, oldTranslations);
  }
});

module.exports = mongoose.model('Dictionary', dictionarySchema);
