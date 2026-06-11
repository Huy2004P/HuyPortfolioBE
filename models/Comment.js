const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  playerName: { type: String, required: true },
  email: { type: String, required: true },
  content: { type: String, required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null }, // For nested replies
  status: { type: String, enum: ['pending', 'approved'], default: 'approved' } // Can default to approved or pending
}, {
  timestamps: true
});

module.exports = mongoose.model('Comment', commentSchema);
