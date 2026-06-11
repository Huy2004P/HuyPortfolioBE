const path = require('path');
const root = process.cwd();

try {
  console.log("Loading User model...");
  require(path.join(root, 'models/User'));

  console.log("Loading Project model...");
  require(path.join(root, 'models/Project'));

  console.log("Loading Profile model...");
  require(path.join(root, 'models/Profile'));

  console.log("Loading Post model...");
  require(path.join(root, 'models/Post'));

  console.log("Loading StaticPage model...");
  require(path.join(root, 'models/StaticPage'));

  console.log("Loading Score model...");
  require(path.join(root, 'models/Score'));

  console.log("Loading Dictionary model...");
  require(path.join(root, 'models/Dictionary'));

  console.log("Loading Comment model...");
  require(path.join(root, 'models/Comment'));

  console.log("Loading Message model...");
  require(path.join(root, 'models/Message'));

  console.log("Loading Subscriber model...");
  require(path.join(root, 'models/Subscriber'));

  console.log("Loading authRoutes...");
  require(path.join(root, 'routes/authRoutes'));

  console.log("Loading projectRoutes...");
  require(path.join(root, 'routes/projectRoutes'));

  console.log("Loading postRoutes...");
  require(path.join(root, 'routes/postRoutes'));

  console.log("Loading profileRoutes...");
  require(path.join(root, 'routes/profileRoutes'));

  console.log("Loading pageRoutes...");
  require(path.join(root, 'routes/pageRoutes'));

  console.log("Loading scoreRoutes...");
  require(path.join(root, 'routes/scoreRoutes'));

  console.log("Loading uploadRoutes...");
  require(path.join(root, 'routes/uploadRoutes'));

  console.log("Loading dictionaryRoutes...");
  require(path.join(root, 'routes/dictionaryRoutes'));

  console.log("Loading contactRoutes...");
  require(path.join(root, 'routes/contactRoutes'));

  console.log("Loading subscriberRoutes...");
  require(path.join(root, 'routes/subscriberRoutes'));

  console.log("Loading commentRoutes...");
  require(path.join(root, 'routes/commentRoutes'));

  console.log("Loading adminRoutes...");
  require(path.join(root, 'routes/adminRoutes'));

  console.log("All modules compiled and loaded successfully!");
} catch (error) {
  console.error("Compilation / Load Error:", error);
  process.exit(1);
}
