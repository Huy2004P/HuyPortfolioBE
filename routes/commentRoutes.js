const express = require('express');
const Comment = require('../models/Comment');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { commentSchema } = require('../middleware/schemas');
const router = express.Router();

// POST /api/comments - Post a comment (Public)
router.post('/', validate(commentSchema), async (req, res) => {
  try {
    const { postId, playerName, email, content, parentId, status } = req.body;
    
    const comment = new Comment({
      postId,
      playerName,
      email,
      content,
      parentId: parentId || null,
      status: status || 'approved' // Default to approved
    });
    
    await comment.save();
    res.status(201).json({ message: 'Comment submitted successfully', data: comment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/comments/post/:postId - Get all approved comments for a specific post (Public)
router.get('/post/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ 
      postId: req.params.postId, 
      status: 'approved' 
    }).sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/comments - List all comments (Admin only)
router.get('/', protect, async (req, res) => {
  try {
    const { status, postId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (postId) filter.postId = postId;
    
    const comments = await Comment.find(filter).sort({ createdAt: -1 }).populate('postId', 'title');
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/comments/:id/status - Update comment status (Admin only)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    comment.status = status;
    await comment.save();
    res.json({ message: 'Comment status updated', data: comment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/comments/:id - Delete comment (Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
