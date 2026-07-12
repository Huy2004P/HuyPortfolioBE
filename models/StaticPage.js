const mongoose = require('mongoose');
const { translateMap, translateText } = require('../utils/translator');

const staticPageSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // 'privacy', 'terms', 'donation', etc.
  title: { type: Map, of: String, required: true }, // Localized title
  navTitle: { type: Map, of: String }, // Optional localized short navigation title
  content: { type: Map, of: String, default: {} }, // Localized content
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }, // Dynamic content: QR codes, bank accs, etc.
  updatedAt: { type: Date, default: Date.now }
});

staticPageSchema.pre('save', async function() {
  this.updatedAt = Date.now();
  
  const oldDoc = this.isNew ? null : await this.constructor.findById(this._id);
  const oldTitle = oldDoc ? oldDoc.title : null;
  const oldNavTitle = oldDoc ? oldDoc.navTitle : null;
  const oldContent = oldDoc ? oldDoc.content : null;

  if (this.isModified('title')) {
    this.title = await translateMap(this.title, oldTitle);
  }
  if (this.isModified('navTitle')) {
    this.navTitle = await translateMap(this.navTitle, oldNavTitle);
  }
  if (this.isModified('content')) {
    this.content = await translateMap(this.content, oldContent);
  }

  // Auto-translate metadata thank-you notes for graduation template if modified
  if (this.isModified('metadata') && this.metadata) {
    const langs = ['en', 'ja', 'ko', 'zh'];
    
    // Family
    const familyVi = this.metadata.familyThanks_vi;
    if (familyVi && familyVi.trim() !== '') {
      for (const lang of langs) {
        const val = this.metadata[`familyThanks_${lang}`];
        if (!val || val.trim() === '') {
          try {
            this.metadata[`familyThanks_${lang}`] = await translateText(familyVi, lang);
          } catch (e) {
            this.metadata[`familyThanks_${lang}`] = familyVi;
          }
        }
      }
    }

    // Teachers
    const teacherVi = this.metadata.teacherThanks_vi;
    if (teacherVi && teacherVi.trim() !== '') {
      for (const lang of langs) {
        const val = this.metadata[`teacherThanks_${lang}`];
        if (!val || val.trim() === '') {
          try {
            this.metadata[`teacherThanks_${lang}`] = await translateText(teacherVi, lang);
          } catch (e) {
            this.metadata[`teacherThanks_${lang}`] = teacherVi;
          }
        }
      }
    }

    // Friends
    const friendVi = this.metadata.friendThanks_vi;
    if (friendVi && friendVi.trim() !== '') {
      for (const lang of langs) {
        const val = this.metadata[`friendThanks_${lang}`];
        if (!val || val.trim() === '') {
          try {
            this.metadata[`friendThanks_${lang}`] = await translateText(friendVi, lang);
          } catch (e) {
            this.metadata[`friendThanks_${lang}`] = friendVi;
          }
        }
      }
    }

    this.markModified('metadata');
  }
});

module.exports = mongoose.model('StaticPage', staticPageSchema);
