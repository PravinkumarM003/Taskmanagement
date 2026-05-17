// server.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

const app = express();
const pkg = require('./package.json');

// Version Header Middleware
app.use((req, res, next) => {
  res.setHeader('X-App-Version', pkg.version);
  next();
});


// ==========================
// CORS CONFIGURATION
// ==========================
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());


// ==========================
// BODY PARSER
// ==========================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ==========================
// API ROUTES
// ==========================
app.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Student Task Management API is running successfully.'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/feedbacks', feedbackRoutes);


// ==========================
// HEALTH CHECK
// ==========================
app.get('/api/health', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Server is running'
  });
});


// ==========================
// 404 HANDLER
// ==========================
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});


// ==========================
// ERROR HANDLER
// ==========================
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err);

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});


// ==========================
// START SERVER
// ==========================
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;