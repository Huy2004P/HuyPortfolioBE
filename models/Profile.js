const mongoose = require('mongoose');
const { translateMap } = require('../utils/translator');

const profileSchema = new mongoose.Schema({
  profileType: { type: String, default: 'main', unique: true }, // 'main', 'mobile', 'game', etc.
  headline: { 
    type: Map, 
    of: String, 
    default: {
      en: "Hi, I'm a Developer.",
      vi: "Xin chào, tôi là một Nhà phát triển."
    }
  },
  subHeadline: { 
    type: Map, 
    of: String, 
    default: {
      en: "I build beautiful, responsive, and highly functional applications with modern technologies.",
      vi: "Tôi xây dựng các ứng dụng đẹp mắt, phản hồi nhanh và giàu chức năng bằng các công nghệ hiện đại."
    }
  },
  techStack: { type: [String], default: [] },
  avatarUrl: { type: String, default: "" },
  socialLinks: { type: Map, of: String, default: {} } // Dynamic social links
});

profileSchema.pre('save', async function() {
  const oldDoc = this.isNew ? null : await this.constructor.findById(this._id);
  const oldHeadline = oldDoc ? oldDoc.headline : null;
  const oldSubHeadline = oldDoc ? oldDoc.subHeadline : null;

  if (this.isModified('headline')) {
    this.headline = await translateMap(this.headline, oldHeadline);
  }
  if (this.isModified('subHeadline')) {
    this.subHeadline = await translateMap(this.subHeadline, oldSubHeadline);
  }
});

module.exports = mongoose.model('Profile', profileSchema);
