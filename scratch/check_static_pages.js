const mongoose = require('mongoose');
const dotenv = require('dotenv');
const StaticPage = require('../models/StaticPage');

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const count = await StaticPage.countDocuments({});
  console.log(`StaticPage count: ${count}`);
  const all = await StaticPage.find({});
  console.log(all);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
