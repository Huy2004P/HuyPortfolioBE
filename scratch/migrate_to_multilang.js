const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/portfolio';

// We define temporary Schemas that allow both String and Mixed so we can read and rewrite cleanly
const rawSchema = new mongoose.Schema({}, { strict: false });

const migrate = async () => {
  try {
    console.log("Connecting to database for migration...");
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected.");

    const Profile = mongoose.model('Profile_Migration', rawSchema, 'profiles');
    const Project = mongoose.model('Project_Migration', rawSchema, 'projects');
    const Post = mongoose.model('Post_Migration', rawSchema, 'posts');
    const StaticPage = mongoose.model('StaticPage_Migration', rawSchema, 'staticpages');

    // Helper to convert field to map
    const toMap = (val) => {
      if (typeof val === 'string') {
        return { en: val, vi: val };
      }
      return val;
    };

    // 1. Migrate Profiles
    console.log("\nMigrating Profiles...");
    const profiles = await Profile.find({});
    for (const doc of profiles) {
      const docObj = doc.toObject();
      let updated = false;

      if (typeof docObj.headline === 'string') {
        doc.set('headline', toMap(docObj.headline));
        updated = true;
      }
      if (typeof docObj.subHeadline === 'string') {
        doc.set('subHeadline', toMap(docObj.subHeadline));
        updated = true;
      }

      if (updated) {
        await doc.save();
        console.log(`Updated Profile ID: ${doc._id}`);
      }
    }

    // 2. Migrate Projects
    console.log("\nMigrating Projects...");
    const projects = await Project.find({});
    for (const doc of projects) {
      const docObj = doc.toObject();
      let updated = false;

      if (typeof docObj.title === 'string') {
        doc.set('title', toMap(docObj.title));
        updated = true;
      }
      if (typeof docObj.description === 'string') {
        doc.set('description', toMap(docObj.description));
        updated = true;
      }
      if (docObj.changelog && Array.isArray(docObj.changelog)) {
        const newChangelog = docObj.changelog.map(item => {
          if (typeof item.notes === 'string') {
            item.notes = toMap(item.notes);
            updated = true;
          }
          return item;
        });
        if (updated) {
          doc.set('changelog', newChangelog);
        }
      }

      if (updated) {
        await doc.save();
        console.log(`Updated Project ID: ${doc._id}`);
      }
    }

    // 3. Migrate Posts
    console.log("\nMigrating Posts...");
    const posts = await Post.find({});
    for (const doc of posts) {
      const docObj = doc.toObject();
      let updated = false;

      if (typeof docObj.title === 'string') {
        doc.set('title', toMap(docObj.title));
        updated = true;
      }
      if (typeof docObj.content === 'string') {
        doc.set('content', toMap(docObj.content));
        updated = true;
      }
      if (typeof docObj.excerpt === 'string') {
        doc.set('excerpt', toMap(docObj.excerpt));
        updated = true;
      }

      if (updated) {
        await doc.save();
        console.log(`Updated Post ID: ${doc._id}`);
      }
    }

    // 4. Migrate StaticPages
    console.log("\nMigrating StaticPages...");
    const pages = await StaticPage.find({});
    for (const doc of pages) {
      const docObj = doc.toObject();
      let updated = false;

      if (typeof docObj.title === 'string') {
        doc.set('title', toMap(docObj.title));
        updated = true;
      }
      if (typeof docObj.content === 'string') {
        doc.set('content', toMap(docObj.content));
        updated = true;
      }

      if (updated) {
        await doc.save();
        console.log(`Updated StaticPage ID: ${doc._id}`);
      }
    }

    console.log("\nMigration completed successfully!");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
};

migrate();
