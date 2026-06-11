const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Profile = require('../models/Profile');

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const profiles = await Profile.find({});
  for (const profile of profiles) {
    console.log(`Profile Type: ${profile.profileType}`);
    console.log(`Headline: ${JSON.stringify(profile.headline ? Object.fromEntries(profile.headline) : {})}`);
    console.log(`SubHeadline: ${JSON.stringify(profile.subHeadline ? Object.fromEntries(profile.subHeadline) : {})}`);
    console.log('---');
  }
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
