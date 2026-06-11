const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Project = require('./models/Project');
const Post = require('./models/Post');
const Profile = require('./models/Profile');
const { translateMap } = require('./utils/translator');

dotenv.config();

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/portfolio';
  console.log('Connecting to database...');
  await mongoose.connect(mongoUri);
  console.log('MongoDB connected.');
};

async function migrate() {
  await connectDB();

  // 1. Translate Profiles
  console.log('\n--- Translating Profiles ---');
  const profiles = await Profile.find({});
  console.log(`Found ${profiles.length} profiles.`);
  for (const profile of profiles) {
    console.log(`Translating profile type: ${profile.profileType}`);

    // Explicitly check and convert plain string if any, then translate
    if (profile.headline) {
      profile.headline = await translateMap(profile.headline);
    }
    if (profile.subHeadline) {
      profile.subHeadline = await translateMap(profile.subHeadline);
    }

    await profile.save();
    console.log(`Saved profile type: ${profile.profileType}`);
  }

  // 2. Translate Projects
  console.log('\n--- Translating Projects ---');
  const projects = await Project.find({});
  console.log(`Found ${projects.length} projects.`);
  for (const project of projects) {
    const titleVi = project.title ? (typeof project.title.get === 'function' ? project.title.get('vi') : project.title.vi) : '';
    console.log(`Translating project: "${titleVi || 'Untitled'}"`);

    if (project.title) {
      project.title = await translateMap(project.title);
    }
    if (project.description) {
      project.description = await translateMap(project.description);
    }
    if (project.changelog && project.changelog.length > 0) {
      for (let i = 0; i < project.changelog.length; i++) {
        if (project.changelog[i].notes) {
          project.changelog[i].notes = await translateMap(project.changelog[i].notes);
        }
      }
    }

    await project.save();
    console.log(`Saved project: "${titleVi || 'Untitled'}"`);
  }

  // 3. Translate Posts
  console.log('\n--- Translating Posts ---');
  const posts = await Post.find({});
  console.log(`Found ${posts.length} posts.`);
  for (const post of posts) {
    const titleVi = post.title ? (typeof post.title.get === 'function' ? post.title.get('vi') : post.title.vi) : '';
    console.log(`Translating blog post: "${titleVi || 'Untitled'}"`);

    if (post.title) {
      post.title = await translateMap(post.title);
    }
    if (post.content) {
      post.content = await translateMap(post.content);
    }
    if (post.excerpt) {
      post.excerpt = await translateMap(post.excerpt);
    }

    await post.save();
    console.log(`Saved blog post: "${titleVi || 'Untitled'}"`);
  }

  console.log('\n====================================================');
  console.log('DATABASE TRANSLATION MIGRATION COMPLETED SUCCESSFULLY!');
  console.log('====================================================');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
