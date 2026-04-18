require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const connectDatabase = require('./config/database');
const initializeFirebase = require('./config/firebaseConfig');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize Firebase and connect to MongoDB
let dbConnected = false;
let firebaseInitialized = false;

(async () => {
  try {
    await connectDatabase();
    dbConnected = true;
    console.log('Database connected');
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }

  try {
    initializeFirebase();
    firebaseInitialized = true;
    console.log('Firebase initialized');
  } catch (error) {
    console.error('Firebase initialization failed:', error.message);
  }
})();

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    database: dbConnected ? 'Connected' : 'Disconnected',
    firebase: firebaseInitialized ? 'Initialized' : 'Not initialized',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

module.exports = app;
