const mongoose = require('mongoose');
const { translateMap } = require('../utils/translator');

const projectSchema = new mongoose.Schema({
  title: { type: Map, of: String, required: true }, // Localized title
  description: { type: Map, of: String, required: true }, // Localized description
  imageUrl: { type: String }, // Main thumbnail image
  screenshots: [{ type: String }], // Gallery of project screenshots/concept arts
  projectType: { type: String, enum: ['web', 'mobile', 'game', 'other'], default: 'web' },
  projectUrl: { type: String },   // GitHub/Web link
  demoUrl: { type: String },      // Live/Apetizo demo link
  apkUrl: { type: String },       // File APK upload direct path (for quick download)
  videoUrl: { type: String },     // YouTube gameplay / walkthrough link
  engine: { type: String },       // Unity, Unreal, Godot (for games)
  platforms: [{ type: String }],  // Android, iOS, Windows, Web, etc.
  playableUrl: { type: String },  // WebGL/HTML5 online play link (e.g., itch.io embed)
  downloadUrls: { type: Map, of: String, default: {} }, // Dynamic map (itchio: url, playstore: url, etc.)
  technologies: [{ type: String }],
  likesCount: { type: Number, default: 0 },
  clicks: { type: Map, of: Number, default: {} }, // Tracks clicks per destination, e.g. { apk: 0, github: 0, playstore: 0 }
  changelog: [{
    version: { type: String, required: true },
    date: { type: Date, default: Date.now },
    notes: { type: Map, of: String, required: true } // Localized notes Map
  }],
  createdAt: { type: Date, default: Date.now },
});

projectSchema.pre('save', async function() {
  if (this.isModified('title')) {
    this.title = await translateMap(this.title);
  }
  if (this.isModified('description')) {
    this.description = await translateMap(this.description);
  }
  if (this.isModified('changelog')) {
    for (let i = 0; i < this.changelog.length; i++) {
      if (this.changelog[i].notes) {
        this.changelog[i].notes = await translateMap(this.changelog[i].notes);
      }
    }
  }
});

module.exports = mongoose.model('Project', projectSchema);
