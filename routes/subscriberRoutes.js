const express = require('express');
const Subscriber = require('../models/Subscriber');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { subscriberSchema } = require('../middleware/schemas');
const router = express.Router();

// POST /api/subscriber - Subscribe to newsletter (Public)
router.post('/', validate(subscriberSchema), async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if email already subscribed
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email is already subscribed' });
    }
    
    const subscriber = new Subscriber({ email });
    await subscriber.save();
    res.status(201).json({ message: 'Subscribed successfully', data: subscriber });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/subscriber - List all subscribers (Admin only)
router.get('/', protect, async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/subscriber/:id - Unsubscribe/Remove a subscriber (Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const subscriber = await Subscriber.findByIdAndDelete(req.params.id);
    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }
    res.json({ message: 'Unsubscribed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
