const express = require('express');
const router = express.Router();
const StaticPage = require('../models/StaticPage');
const { protect } = require('../middleware/authMiddleware');

// GET /api/pages/:key — Fetch static page content (Public)
router.get('/:key', async (req, res) => {
  try {
    const page = await StaticPage.findOne({ key: req.params.key });
    if (!page) {
      return res.status(404).json({ message: `Page with key '${req.params.key}' not found` });
    }
    res.json(page);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/pages/:key — Create or update static page content (Protected)
router.put('/:key', protect, async (req, res) => {
  try {
    const { title, content, metadata } = req.body;
    let page = await StaticPage.findOne({ key: req.params.key });

    if (!page) {
      if (!title) {
        return res.status(400).json({ message: 'Title is required to create a new page' });
      }
      page = await StaticPage.create({
        key: req.params.key,
        title,
        content: content || "",
        metadata: metadata || {}
      });
    } else {
      if (title !== undefined) page.title = title;
      if (content !== undefined) page.content = content;
      if (metadata !== undefined) page.metadata = metadata;
      await page.save();
    }

    res.json(page);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data or request error', error: error.message });
  }
});

module.exports = router;
