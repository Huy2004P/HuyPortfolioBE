const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Dictionary = require('../models/Dictionary');

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const keys = [
    'Mobile: Flutter',
    'Web: Html - Css - Javascript',
    'Database: MySQL - MongoDB - Firebase',
    'Framework: Node JS',
    'Workflow Automation: n8n',
    'Server: HomeServer',
    'lbl_newsletter',
    'txt_newsletter_desc',
    'lbl_newsletter_placeholder',
    'btn_subscribe',
    'nav_privacy',
    'nav_terms',
    'nav_donation',
    'footer_rights'
  ];
  const entries = await Dictionary.find({ key: { $in: keys } });
  for (const entry of entries) {
    console.log(`Key: ${entry.key}`);
    console.log(JSON.stringify(entry.translations, null, 2));
    console.log('---');
  }
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
