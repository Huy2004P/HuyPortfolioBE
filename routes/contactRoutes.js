const express = require('express');
const Message = require('../models/Message');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { messageSchema } = require('../middleware/schemas');
const https = require('https');
const router = express.Router();

// Helper function to send Telegram notification
function sendTelegramNotification(name, email, subject, message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.log('Telegram Bot Token or Chat ID not configured in .env');
    return;
  }
  
  const text = `🔔 *New Contact Message!*\n\n*Name:* ${name}\n*Email:* ${email}\n*Subject:* ${subject}\n*Message:* ${message}`;
  
  const data = JSON.stringify({
    chat_id: chatId,
    text: text,
    parse_mode: 'Markdown'
  });
  
  const options = {
    hostname: 'api.telegram.org',
    port: 443,
    path: `/bot${token}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };
  
  const req = https.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    res.on('end', () => {
      console.log('Telegram API Response status:', res.statusCode);
    });
  });
  
  req.on('error', (error) => {
    console.error('Telegram notification request error:', error);
  });
  
  req.write(data);
  req.end();
}

// POST /api/contact - Submit contact form (Public)
router.post('/', validate(messageSchema), async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    const newMessage = new Message({
      name,
      email,
      subject: subject || 'Contact from Portfolio',
      message
    });
    
    await newMessage.save();
    
    // Trigger Telegram alert asynchronously
    sendTelegramNotification(name, email, subject || 'Contact from Portfolio', message);
    
    res.status(201).json({ message: 'Message sent successfully', data: newMessage });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/contact - Retrieve all contact messages (Admin only)
router.get('/', protect, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/contact/:id/read - Mark message as read (Admin only)
router.put('/:id/read', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    message.isRead = true;
    await message.save();
    res.json({ message: 'Message marked as read', data: message });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/contact/:id - Delete a message (Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
