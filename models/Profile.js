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
  if (this.isModified('headline')) {
    this.headline = await translateMap(this.headline);
  }
  if (this.isModified('subHeadline')) {
    this.subHeadline = await translateMap(this.subHeadline);
  }
});

module.exports = mongoose.model('Profile', profileSchema);
