/**
 * Minimal server with local logger implementation
 */

// Load environment variables
require('dotenv').config();

// Set JWT_SECRET if not already set
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'minimal-jwt-secret-for-testing';
  console.log('Set JWT_SECRET for testing');
}

// Create a simple logger
const simpleLogger = {
  info: (message) => console.log(`\x1b[32m[INFO]\x1b[0m ${message}`),
  debug: (message) => console.log(`\x1b[36m[DEBUG]\x1b[0m ${message}`),
  warn: (message) => console.log(`\x1b[33m[WARN]\x1b[0m ${message}`),
  error: (message) => console.log(`\x1b[31m[ERROR]\x1b[0m ${message}`)
};

// Set up Express
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 4200;

// Log environment variables
simpleLogger.info('Starting minimal server with environment:');
simpleLogger.info(`- JWT_SECRET: ${process.env.JWT_SECRET ? '[SET]' : '[NOT SET]'}`);
simpleLogger.info(`- PORT: ${port}`);
simpleLogger.info(`- NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
simpleLogger.info(`- MONGODB_URI: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform'}`);

// Middleware
app.use(express.json());
app.use(cors());

// Request logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const method = req.method;
    const url = req.originalUrl;
    
    simpleLogger.info(`${method} ${url} ${statusCode} - ${duration}ms`);
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Test logger endpoint
app.get('/test-logger', (req, res) => {
  // Test all log levels
  simpleLogger.debug('This is a debug message');
  simpleLogger.info('This is an info message');
  simpleLogger.warn('This is a warning message');
  simpleLogger.error('This is an error message');
  
  // Test with error object
  try {
    throw new Error('Test error');
  } catch (error) {
    simpleLogger.error(`Caught an error: ${error.message}`);
    simpleLogger.error(error.stack);
  }
  
  res.status(200).json({
    status: 'ok',
    message: 'Logger test complete, check console output'
  });
});

// MongoDB test endpoint
app.get('/mongodb-test', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    simpleLogger.info('Connecting to MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform');
    
    simpleLogger.info(`MongoDB Connected: ${mongoose.connection.host}`);
    
    // Log available collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    simpleLogger.info(`Available collections: ${collections.map(c => c.name).join(', ')}`);
    
    res.status(200).json({
      status: 'ok',
      connected: true,
      host: mongoose.connection.host,
      collections: collections.map(c => c.name)
    });
    
    // Close the connection
    await mongoose.connection.close();
    simpleLogger.info('MongoDB connection closed');
  } catch (error) {
    simpleLogger.error(`MongoDB connection error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to connect to MongoDB',
      error: error.message
    });
  }
});

// Start server
app.listen(port, () => {
  simpleLogger.info(`Minimal server running at http://localhost:${port}`);
  simpleLogger.info('Available endpoints:');
  simpleLogger.info(`- Health check: http://localhost:${port}/health`);
  simpleLogger.info(`- Test logger: http://localhost:${port}/test-logger`);
  simpleLogger.info(`- MongoDB test: http://localhost:${port}/mongodb-test`);
}); 