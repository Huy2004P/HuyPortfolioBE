const mongoose = require('mongoose');
const { translateMap } = require('../utils/translator');

const postSchema = new mongoose.Schema({
  title: { type: Map, of: String, required: true }, // Localized title
  slug: { type: String, required: true, unique: true },
  content: { type: Map, of: String, required: true }, // Localized content
  excerpt: { type: Map, of: String }, // Localized excerpt
  coverImage: { type: String },
  category: { type: String, default: 'general' }, // 'general', 'mobile', 'game', etc.
  tags: [{ type: String }],
  published: { type: Boolean, default: false },
  likesCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

postSchema.pre('save', async function() {
  if (this.isModified('title')) {
    this.title = await translateMap(this.title);
  }
  if (this.isModified('content')) {
    this.content = await translateMap(this.content);
  }
  if (this.isModified('excerpt')) {
    this.excerpt = await translateMap(this.excerpt);
  }
});

module.exports = mongoose.model('Post', postSchema);
