const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const { protect } = require('../middleware/authMiddleware');

router.get('/', async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create({});
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/', protect, async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create(req.body);
    } else {
      profile.headline = req.body.headline || profile.headline;
      profile.subHeadline = req.body.subHeadline || profile.subHeadline;
      profile.techStack = req.body.techStack || profile.techStack;
      if (req.body.avatarUrl !== undefined) {
        profile.avatarUrl = req.body.avatarUrl;
      }
      await profile.save();
    }
    res.json(profile);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

module.exports = router;
