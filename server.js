const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/portfolio';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// --- AUTO PING TO KEEP SERVER AWAKE ---
app.get('/ping', (req, res) => {
  res.status(200).send('Server is awake!');
});

const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes
function keepServerAwake() {
  // Use SERVER_URL from .env if available, otherwise fallback to localhost (for testing)
  const url = process.env.SERVER_URL || `http://localhost:${PORT}/ping`;
  const httpModule = url.startsWith('https') ? require('https') : require('http');
  
  httpModule.get(url, (res) => {
    if (res.statusCode === 200) {
      console.log(`[${new Date().toISOString()}] Keep-alive ping successful.`);
    } else {
      console.log(`[${new Date().toISOString()}] Keep-alive ping failed with status code: ${res.statusCode}`);
    }
  }).on('error', (err) => {
    console.error(`[${new Date().toISOString()}] Keep-alive ping error:`, err.message);
  });
}

// Start the ping interval
setInterval(keepServerAwake, PING_INTERVAL);
// --------------------------------------

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
