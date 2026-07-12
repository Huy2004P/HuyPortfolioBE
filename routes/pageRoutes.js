const express = require('express');
const router = express.Router();
const StaticPage = require('../models/StaticPage');
const { protect } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

// GET /api/pages — Fetch all pages (Public returns published + system pages, Admin can query all if authorized)
router.get('/', async (req, res) => {
  try {
    const pages = await StaticPage.find({});
    
    // Check if the user is authenticated as admin
    let isAdmin = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        if (decoded && decoded.id) {
          isAdmin = true;
        }
      } catch (err) {
        // Invalid token, treat as public
      }
    }

    if (isAdmin) {
      return res.json(pages);
    }

    // Public filtering
    const publicPages = pages.filter(page => {
      if (!page.metadata || !page.metadata.isCustom) return true; // Predefined pages are always public
      return page.metadata.isPublished === true;
    });

    res.json(publicPages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/pages/:key — Fetch static page content (Public)
router.get('/:key', async (req, res) => {
  try {
    const page = await StaticPage.findOne({ key: req.params.key });
    if (!page) {
      return res.status(404).json({ message: `Page with key '${req.params.key}' not found` });
    }
    
    // For custom pages, check if published or if admin is requesting it
    if (page.metadata && page.metadata.isCustom && page.metadata.isPublished === false) {
      let isAdmin = false;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
          if (decoded && decoded.id) {
            isAdmin = true;
          }
        } catch (err) {}
      }
      if (!isAdmin) {
        return res.status(403).json({ message: 'This page is a draft and is not public' });
      }
    }

    res.json(page);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/pages/:key — Create or update static page content (Protected)
router.put('/:key', protect, async (req, res) => {
  try {
    const { title, navTitle, content, metadata } = req.body;
    let page = await StaticPage.findOne({ key: req.params.key });

    if (!page) {
      if (!title) {
        return res.status(400).json({ message: 'Title is required to create a new page' });
      }
      page = await StaticPage.create({
        key: req.params.key,
        title,
        navTitle: navTitle || {},
        content: content || {},
        metadata: metadata || {}
      });
    } else {
      if (title !== undefined) page.title = title;
      if (navTitle !== undefined) page.navTitle = navTitle;
      if (content !== undefined) page.content = content;
      if (metadata !== undefined) page.metadata = metadata;
      await page.save();
    }

    res.json(page);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data or request error', error: error.message });
  }
});

// DELETE /api/pages/:key — Delete static/custom page (Protected, Admin Only)
router.delete('/:key', protect, async (req, res) => {
  try {
    const page = await StaticPage.findOne({ key: req.params.key });
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    // Prevent deletion of system pages
    if (!page.metadata || !page.metadata.isCustom) {
      return res.status(400).json({ message: 'System pages cannot be deleted' });
    }

    await page.deleteOne();
    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
