const express = require('express');
const router = express.Router();
const Score = require('../models/Score');
const Project = require('../models/Project');
const validate = require('../middleware/validate');
const { scoreSchema } = require('../middleware/schemas');

// POST /api/scores — Submit a new high score
router.post('/', validate(scoreSchema), async (req, res) => {
  const { playerName, projectId, score } = req.body;
  try {
    // Check if the game project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Game project not found' });
    }
    
    if (project.projectType !== 'game') {
      return res.status(400).json({ message: 'Project is not classified as a game' });
    }

    const newScore = await Score.create({
      playerName,
      projectId,
      score
    });

    res.status(201).json(newScore);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/scores/:projectId — Get top 10 scores for a game
router.get('/:projectId', async (req, res) => {
  try {
    const scores = await Score.find({ projectId: req.params.projectId })
      .sort({ score: -1 })
      .limit(10)
      .select('playerName score playedAt');
    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
