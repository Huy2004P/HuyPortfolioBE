const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  headline: { type: String, default: "Hi, I'm a Flutter Developer." },
  subHeadline: { type: String, default: "I build beautiful, responsive, and highly functional cross-platform applications with modern technologies." },
  techStack: { type: [String], default: ["Flutter", "Dart", "Firebase", "Node.js", "MongoDB", "React", "Tailwind CSS"] },
  avatarUrl: { type: String, default: "" }
});

module.exports = mongoose.model('Profile', profileSchema);
