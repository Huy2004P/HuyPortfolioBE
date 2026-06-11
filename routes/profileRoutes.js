const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { profileSchema } = require('../middleware/schemas');

// Helper to get or create default profile by type
const getOrCreateProfile = async (type) => {
  let profile = await Profile.findOne({ profileType: type });
  if (!profile) {
    profile = await Profile.create({
      profileType: type,
      headline: {
        en: `Hi, I'm a ${type.charAt(0).toUpperCase() + type.slice(1)} Developer.`,
        vi: `Xin chào, tôi là một Nhà phát triển ${type.charAt(0).toUpperCase() + type.slice(1)}.`
      },
      subHeadline: {
        en: `I build amazing things for ${type}.`,
        vi: `Tôi xây dựng các sản phẩm tuyệt vời cho ${type}.`
      },
      techStack: [],
      avatarUrl: "",
      socialLinks: {}
    });
  }
  return profile;
};

// GET /api/profile — Get main profile (Default)
router.get('/', async (req, res) => {
  try {
    const profile = await getOrCreateProfile('main');
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/profile/:type — Get profile by type ('main', 'mobile', 'game', etc.)
router.get('/:type', async (req, res) => {
  try {
    const type = req.params.type || 'main';
    const profile = await getOrCreateProfile(type);
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/profile — Update main profile (Protected)
router.put('/', protect, validate(profileSchema), async (req, res) => {
  try {
    let profile = await Profile.findOne({ profileType: 'main' });
    if (!profile) {
      profile = await Profile.create({ ...req.body, profileType: 'main' });
    } else {
      profile.headline = req.body.headline !== undefined ? req.body.headline : profile.headline;
      profile.subHeadline = req.body.subHeadline !== undefined ? req.body.subHeadline : profile.subHeadline;
      profile.techStack = req.body.techStack !== undefined ? req.body.techStack : profile.techStack;
      profile.avatarUrl = req.body.avatarUrl !== undefined ? req.body.avatarUrl : profile.avatarUrl;
      profile.socialLinks = req.body.socialLinks !== undefined ? req.body.socialLinks : profile.socialLinks;
      await profile.save();
    }
    res.json(profile);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
});

// PUT /api/profile/:type — Update profile by type (Protected)
router.put('/:type', protect, validate(profileSchema), async (req, res) => {
  try {
    const type = req.params.type;
    let profile = await Profile.findOne({ profileType: type });
    if (!profile) {
      profile = await Profile.create({ ...req.body, profileType: type });
    } else {
      profile.headline = req.body.headline !== undefined ? req.body.headline : profile.headline;
      profile.subHeadline = req.body.subHeadline !== undefined ? req.body.subHeadline : profile.subHeadline;
      profile.techStack = req.body.techStack !== undefined ? req.body.techStack : profile.techStack;
      profile.avatarUrl = req.body.avatarUrl !== undefined ? req.body.avatarUrl : profile.avatarUrl;
      profile.socialLinks = req.body.socialLinks !== undefined ? req.body.socialLinks : profile.socialLinks;
      await profile.save();
    }
    res.json(profile);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
});

module.exports = router;
