const express = require('express');
const Project = require('../models/Project');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Subscriber = require('../models/Subscriber');
const Message = require('../models/Message');
const { protect } = require('../middleware/authMiddleware');
const os = require('os');
const router = express.Router();

// GET /api/admin/dashboard-stats - Retrieve dashboard statistics (Admin only)
router.get('/dashboard-stats', protect, async (req, res) => {
  try {
    // 1. Core Counts
    const totalProjects = await Project.countDocuments();
    const totalPosts = await Post.countDocuments();
    const totalComments = await Comment.countDocuments();
    const totalSubscribers = await Subscriber.countDocuments();
    const totalMessages = await Message.countDocuments();
    const unreadMessages = await Message.countDocuments({ isRead: false });
    
    // 2. Click and Likes Aggregation
    const projects = await Project.find({});
    let totalProjectClicks = 0;
    let totalProjectLikes = 0;
    const projectStats = [];
    
    projects.forEach(p => {
      let pClicks = 0;
      if (p.clicks) {
        const clicksObj = p.clicks instanceof Map ? Object.fromEntries(p.clicks) : p.clicks;
        Object.values(clicksObj).forEach((val) => {
          if (typeof val === 'number') {
            pClicks += val;
          }
        });
      }
      totalProjectClicks += pClicks;
      totalProjectLikes += p.likesCount || 0;
      
      projectStats.push({
        id: p._id,
        title: p.title,
        clicks: pClicks,
        likes: p.likesCount || 0
      });
    });
    
    const posts = await Post.find({});
    let totalPostLikes = 0;
    posts.forEach(post => {
      totalPostLikes += post.likesCount || 0;
    });
    
    // 3. System Metrics
    const freeMem = os.freemem();
    const totalMem = os.totalmem();
    const memoryUsagePercent = ((totalMem - freeMem) / totalMem) * 100;
    
    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      cpuCount: os.cpus().length,
      uptime: Math.floor(process.uptime()), // Server process uptime in seconds
      systemUptime: Math.floor(os.uptime()), // OS uptime in seconds
      freeMemoryGB: (freeMem / (1024 * 1024 * 1024)).toFixed(2),
      totalMemoryGB: (totalMem / (1024 * 1024 * 1024)).toFixed(2),
      memoryUsagePercent: memoryUsagePercent.toFixed(1),
      nodeVersion: process.version
    };
    
    res.json({
      counts: {
        projects: totalProjects,
        posts: totalPosts,
        comments: totalComments,
        subscribers: totalSubscribers,
        messages: totalMessages,
        unreadMessages
      },
      engagement: {
        totalProjectClicks,
        totalProjectLikes,
        totalPostLikes,
        projectStats
      },
      system: systemInfo
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
