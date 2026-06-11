const express = require('express');
const Dictionary = require('../models/Dictionary');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { dictionarySchema } = require('../middleware/schemas');
const router = express.Router();

// GET /api/dictionary - Get all items with full translation mappings
router.get('/', async (req, res) => {
  try {
    const items = await Dictionary.find({});
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/dictionary/:lang - Get a localized key-value map for direct UI usage
router.get('/:lang', async (req, res) => {
  try {
    const lang = req.params.lang;
    const items = await Dictionary.find({});
    const result = {};
    items.forEach(item => {
      // Extract from Map representation
      const translations = item.translations ? Object.fromEntries(item.translations) : {};
      result[item.key] = translations[lang] || translations['en'] || translations['vi'] || '';
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/dictionary/:key - Create or update a dictionary entry (Admin only)
// Uses validate middleware on dictionarySchema (key is verified in body/param)
router.put('/:key', protect, validate(dictionarySchema), async (req, res) => {
  try {
    const { key } = req.params;
    const { translations } = req.body;
    
    // Ensure req.body.key matches param key or just use body key
    let item = await Dictionary.findOne({ key });
    if (item) {
      item.translations = translations;
      await item.save();
    } else {
      item = new Dictionary({ key, translations });
      await item.save();
    }
    res.json({ message: 'Dictionary entry updated successfully', item });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
