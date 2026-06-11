const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Project = require('../models/Project');

dotenv.config();

const check = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");
    
    const usersCount = await User.countDocuments();
    const profilesCount = await Profile.countDocuments();
    const projectsCount = await Project.countDocuments();
    
    console.log(`Users count: ${usersCount}`);
    console.log(`Profiles count: ${profilesCount}`);
    console.log(`Projects count: ${projectsCount}`);
    
    const users = await User.find({}, { password: 0 });
    console.log("Users in DB:", users);
    
    const profiles = await Profile.find({});
    console.log("Profiles in DB:", profiles);
    
    process.exit(0);
  } catch (err) {
    console.error("Check failed:", err);
    process.exit(1);
  }
};

check();
