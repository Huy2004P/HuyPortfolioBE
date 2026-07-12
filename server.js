const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const {
  authLimiter,
  contactLimiter,
  commentLimiter,
  mongoSanitize,
  firewall,
  ipWhitelist,
  csrfCheck,
  xssSanitize
} = require('./middleware/security');

dotenv.config();

const app = express();

// Set security HTTP headers
app.use(helmet());

// Enable Cross-Origin Resource Sharing with dynamic whitelisted origins
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) 
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/$/, '');
    const isAllowed = allowedOrigins.some(o => o.replace(/\/$/, '') === cleanOrigin);
    if (isAllowed || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Parse incoming request body as JSON
app.use(express.json());

// Global Input Protection & Sanitization Suite
app.use(mongoSanitize);
app.use(firewall);
app.use(csrfCheck);
app.use(xssSanitize);

// Global Rate Limiting (Limit each IP to 100 requests per 15 minutes in production, 10000 in dev)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 10000,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api/', globalLimiter);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/portfolio';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// API Routes registration
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/pages', require('./routes/pageRoutes'));
app.use('/api/scores', require('./routes/scoreRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/dictionary', require('./routes/dictionaryRoutes'));
app.use('/api/contact', contactLimiter, require('./routes/contactRoutes'));
app.use('/api/subscriber', require('./routes/subscriberRoutes'));
app.use('/api/comments', commentLimiter, require('./routes/commentRoutes'));
app.use('/api/admin', ipWhitelist, require('./routes/adminRoutes'));

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
