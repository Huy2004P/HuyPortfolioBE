const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Profile = require('../models/Profile');

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas.");

    // 1. Delete the dummy profiles created during testing
    const dummyIds = [
      '6a28db62715cfa067bf958cb', // dummy main
      '6a28db6c715cfa067bf958cc', // dummy mobile
      '6a28db72715cfa067bf958cd'  // dummy game
    ];

    const deleteResult = await Profile.deleteMany({ _id: { $in: dummyIds } });
    console.log(`Deleted ${deleteResult.deletedCount} dummy profiles.`);

    // 2. Find their original profile and make sure it has profileType set to 'main'
    const originalProfileId = '69eb064f596663010e2a07da';
    const originalProfile = await Profile.findById(originalProfileId);
    
    if (originalProfile) {
      originalProfile.profileType = 'main';
      // Ensure we preserve the original fields
      await originalProfile.save();
      console.log("Original profile updated successfully to 'main':", originalProfile);
    } else {
      console.log("Original profile not found by ID. Searching by headline...");
      const findByHeadline = await Profile.findOne({ headline: /Xin chào/ });
      if (findByHeadline) {
        findByHeadline.profileType = 'main';
        await findByHeadline.save();
        console.log("Found and updated original profile by headline:", findByHeadline);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
};

run();
