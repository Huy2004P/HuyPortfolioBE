const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/portfolio';

const StaticPage = require('../models/StaticPage');

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    let page = await StaticPage.findOne({ key: 'graduation' });
    if (page) {
      page.navTitle = {
        vi: "Tốt Nghiệp 🎓",
        en: "Graduation 🎓"
      };
      await page.save();
      console.log('Updated page successfully!');
      
      const updatedPage = await StaticPage.findOne({ key: 'graduation' });
      console.log('Updated Page Document:', JSON.stringify(updatedPage, null, 2));
    } else {
      console.log('Page not found');
    }
    mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
