const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/portfolio';

const StaticPage = require('../models/StaticPage');
const { translateText } = require('../utils/translator');

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    let page = await StaticPage.findOne({ key: 'graduation' });
    if (page) {
      const langs = ['en', 'ja', 'ko', 'zh'];
      
      const titleVi = page.title.get('vi');
      console.log('Translating Title:', titleVi);
      for (const lang of langs) {
        page.title.set(lang, await translateText(titleVi, lang));
      }

      if (page.navTitle) {
        const navVi = page.navTitle.get('vi') || 'Tốt Nghiệp 🎓';
        console.log('Translating NavTitle:', navVi);
        for (const lang of langs) {
          page.navTitle.set(lang, await translateText(navVi, lang));
        }
      }

      const contentVi = page.content.get('vi');
      if (contentVi) {
        console.log('Translating Content...');
        for (const lang of langs) {
          page.content.set(lang, await translateText(contentVi, lang));
        }
      }

      // Family thanks
      const familyVi = page.metadata.familyThanks_vi;
      if (familyVi) {
        console.log('Translating Family Thanks...');
        for (const lang of langs) {
          page.metadata[`familyThanks_${lang}`] = await translateText(familyVi, lang);
        }
      }

      // Teacher thanks
      const teacherVi = page.metadata.teacherThanks_vi;
      if (teacherVi) {
        console.log('Translating Teacher Thanks...');
        for (const lang of langs) {
          page.metadata[`teacherThanks_${lang}`] = await translateText(teacherVi, lang);
        }
      }

      // Friend thanks
      const friendVi = page.metadata.friendThanks_vi;
      if (friendVi) {
        console.log('Translating Friend Thanks...');
        for (const lang of langs) {
          page.metadata[`friendThanks_${lang}`] = await translateText(friendVi, lang);
        }
      }

      page.markModified('title');
      page.markModified('navTitle');
      page.markModified('content');
      page.markModified('metadata');

      await page.save();
      console.log('Updated and translated graduation page fully!');
    } else {
      console.log('Page not found');
    }
    mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
