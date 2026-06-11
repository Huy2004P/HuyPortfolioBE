const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Project = require('../models/Project');

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const projects = await Project.find({});
  for (const project of projects) {
    console.log(`Project ID: ${project._id}`);
    console.log(`Title: ${JSON.stringify(Object.fromEntries(project.title))}`);
    console.log(`Description: ${JSON.stringify(Object.fromEntries(project.description))}`);
    console.log('---');
  }
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
