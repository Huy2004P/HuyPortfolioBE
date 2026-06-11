const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { projectSchema } = require('../middleware/schemas');

// GET /api/projects — Get all projects (supports pagination, search, type filtering)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) {
      filter.projectType = req.query.type;
    }
    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: 'i' };
      filter.$or = [
        { "title.vi": searchRegex },
        { "title.en": searchRegex },
        { "title.ja": searchRegex },
        { "title.ko": searchRegex },
        { "title.zh": searchRegex },
        { "description.vi": searchRegex },
        { "description.en": searchRegex },
        { "description.ja": searchRegex },
        { "description.ko": searchRegex },
        { "description.zh": searchRegex },
        { technologies: searchRegex }
      ];
    }

    // Paginated response if page or limit query parameters are provided
    if (req.query.page || req.query.limit) {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const total = await Project.countDocuments(filter);
      const projects = await Project.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return res.json({
        data: projects,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      });
    }

    // Return direct array for backward compatibility
    const projects = await Project.find(filter).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/projects — Create a new project (Admin Only)
router.post('/', protect, validate(projectSchema), async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
});

// GET /api/projects/:id — Get details of a single project
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (project) {
      res.json(project);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/projects/:id — Update a project (Admin Only)
router.put('/:id', protect, validate(projectSchema), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (project) {
      Object.assign(project, req.body);
      await project.save();
      res.json(project);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
});

// DELETE /api/projects/:id — Delete a project (Admin Only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (project) {
      await project.deleteOne();
      res.json({ message: 'Project removed' });
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/projects/:id/like — Increment likes count (Public)
router.post('/:id/like', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    project.likesCount = (project.likesCount || 0) + 1;
    await project.save();
    res.json({ message: 'Project liked successfully', likesCount: project.likesCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/projects/:id/click — Track link click (Public)
// Body: { destination: 'apk' | 'github' | 'demo' | 'playstore' | 'appstore' | 'itchio' }
router.post('/:id/click', async (req, res) => {
  try {
    const { destination } = req.body;
    if (!destination) {
      return res.status(400).json({ message: 'Destination field is required' });
    }
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (!project.clicks) {
      project.clicks = new Map();
    }
    
    const current = project.clicks.get(destination) || 0;
    project.clicks.set(destination, current + 1);
    await project.save();
    
    res.json({ 
      message: 'Click tracked successfully', 
      clicks: Object.fromEntries(project.clicks) 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
