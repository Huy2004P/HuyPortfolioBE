const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas.");

    const user = await User.findOne({ username: 'admin' });
    if (!user) {
      console.log("Admin user not found. Creating a new one...");
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      await User.create({
        username: 'admin',
        password: hashedPassword
      });
      console.log("Admin user created with password 'admin123'");
    } else {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash('admin123', salt);
      await user.save();
      console.log("Admin password reset to 'admin123'");
    }

    process.exit(0);
  } catch (err) {
    console.error("Password reset failed:", err);
    process.exit(1);
  }
};

run();
