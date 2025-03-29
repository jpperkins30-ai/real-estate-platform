/**
 * JavaScript Server Bypass for TypeScript Errors
 * This server uses plain JavaScript to avoid TypeScript compilation errors
 */

// Load environment variables
require('dotenv').config();

// Set default JWT_SECRET if not set
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'development-jwt-secret';
  console.log('Set default JWT_SECRET for development');
}

// Create simple logger
const logger = {
  info: (message) => console.log(`\x1b[32m[INFO]\x1b[0m ${message}`),
  error: (message) => console.log(`\x1b[31m[ERROR]\x1b[0m ${message}`),
  warn: (message) => console.log(`\x1b[33m[WARN]\x1b[0m ${message}`),
  debug: (message) => console.log(`\x1b[36m[DEBUG]\x1b[0m ${message}`)
};

// Log environment setup
logger.info('Starting JavaScript server with environment:');
logger.info(`- JWT_SECRET: [SET]`);
logger.info(`- PORT: ${process.env.PORT || 4000}`);
logger.info(`- NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
logger.info(`- MONGODB_URI: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform'}`);

// Import dependencies
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Import routes
const authRoutes = require('./src/routes/auth-bypass');

// Create Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cors());

// Request logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    logger.info(`${req.method} ${req.originalUrl} ${statusCode} - ${duration}ms`);
  });
  next();
});

// Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'JavaScript server is running'
  });
});

// Test JWT endpoint
app.get('/api/test-jwt', (req, res) => {
  try {
    const jwt = require('jsonwebtoken');
    const payload = { test: true, timestamp: Date.now() };
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    res.json({
      success: true,
      message: 'JWT is working correctly',
      token,
      decoded
    });
  } catch (error) {
    logger.error(`JWT test error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'JWT test failed',
      error: error.message
    });
  }
});

// MongoDB test endpoint
app.get('/api/mongodb-test', async (req, res) => {
  try {
    // Only try to connect if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      return res.status(200).json({
        connected: false,
        message: 'MONGODB_URI not set, skipping connection test'
      });
    }

    // Connect to MongoDB
    logger.info('Testing MongoDB connection...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Get collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Close connection
    await mongoose.connection.close();
    
    res.json({
      connected: true,
      message: 'MongoDB connection successful',
      host: mongoose.connection.host,
      collections: collectionNames
    });
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    res.status(500).json({
      connected: false,
      message: 'MongoDB connection failed',
      error: error.message
    });
  }
});

// Catch-all route
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`JavaScript server running on port ${PORT}`);
  logger.info('Available endpoints:');
  logger.info(`- Auth routes: http://localhost:${PORT}/api/auth/*`);
  logger.info(`- Health check: http://localhost:${PORT}/api/health`);
  logger.info(`- JWT test: http://localhost:${PORT}/api/test-jwt`);
  logger.info(`- MongoDB test: http://localhost:${PORT}/api/mongodb-test`);
}); 