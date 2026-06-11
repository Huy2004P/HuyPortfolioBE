const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();

// Set security HTTP headers
app.use(helmet());

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Parse incoming request body as JSON
app.use(express.json());

// Global Rate Limiting (Limit each IP to 100 requests per 15 minutes)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api/', globalLimiter);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/portfolio';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// API Routes registration
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/pages', require('./routes/pageRoutes'));
app.use('/api/scores', require('./routes/scoreRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/dictionary', require('./routes/dictionaryRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/subscriber', require('./routes/subscriberRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// --- AUTO PING TO KEEP SERVER AWAKE ---
app.get('/ping', (req, res) => {
  res.status(200).send('Server is awake!');
});

const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes
function keepServerAwake() {
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
