const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  playerName: { type: String, required: true, trim: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true }, // The game project
  score: { type: Number, required: true },
  playedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Score', scoreSchema);
