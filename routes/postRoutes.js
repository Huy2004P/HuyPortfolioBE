const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { postSchema } = require('../middleware/schemas');

// GET /api/posts — Get all blog posts (supports pagination, search, category/tag filtering)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.tag) {
      filter.tags = req.query.tag;
    }
    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: 'i' };
      filter.$or = [
        { "title.vi": searchRegex },
        { "title.en": searchRegex },
        { "title.ja": searchRegex },
        { "title.ko": searchRegex },
        { "title.zh": searchRegex },
        { "excerpt.vi": searchRegex },
        { "excerpt.en": searchRegex },
        { "excerpt.ja": searchRegex },
        { "excerpt.ko": searchRegex },
        { "excerpt.zh": searchRegex },
        { "content.vi": searchRegex },
        { "content.en": searchRegex },
        { "content.ja": searchRegex },
        { "content.ko": searchRegex },
        { "content.zh": searchRegex }
      ];
    }

    // Paginated response if page or limit query parameters are provided
    if (req.query.page || req.query.limit) {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const total = await Post.countDocuments(filter);
      const posts = await Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return res.json({
        data: posts,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      });
    }

    // Return direct array for backward compatibility
    const posts = await Post.find(filter).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/posts — Create a new post (Admin Only)
router.post('/', protect, validate(postSchema), async (req, res) => {
  try {
    const post = await Post.create(req.body);
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
});

// GET /api/posts/:slug — Get a single post by slug
router.get('/:slug', async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug });
    if (post) {
      res.json(post);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/posts/:id — Update a post (Admin Only)
router.put('/:id', protect, validate(postSchema), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post) {
      Object.assign(post, req.body);
      await post.save();
      res.json(post);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
});

// DELETE /api/posts/:id — Delete a post (Admin Only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post) {
      await post.deleteOne();
      res.json({ message: 'Post removed' });
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/posts/:id/like — Increment likes count for a post (Public)
router.post('/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    post.likesCount = (post.likesCount || 0) + 1;
    await post.save();
    res.json({ message: 'Post liked successfully', likesCount: post.likesCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
