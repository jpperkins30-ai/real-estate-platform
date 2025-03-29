/**
 * Simplified Express server for the Real Estate Platform
 * This server focuses on basic functionality without complex dependencies
 * 
 * Usage: node src/simple-server.js
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');

// ============================
// ENVIRONMENT SETUP
// ============================

// Check for JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET environment variable is not set. This is a security risk.');
  process.exit(1);
}

// Store JWT secret in a variable to ensure it's never undefined
const JWT_SECRET = process.env.JWT_SECRET;

// Print environment variables for debugging
console.log('Environment variables:');
console.log('- PORT:', process.env.PORT || 4000);
console.log('- NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('- MONGODB_URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform');
console.log('- JWT_SECRET:', JWT_SECRET ? 'SET' : 'NOT SET');

// ============================
// APPLICATION SETUP
// ============================

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
  maxAge: 86400 // 24 hours
};
app.use(cors(corsOptions));

// ============================
// ROUTES
// ============================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'API is operational'
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// JWT test endpoint
app.get('/api/test-jwt', (req, res) => {
  try {
    const token = jwt.sign({ test: 'success' }, JWT_SECRET, { expiresIn: '1h' });
    const decoded = jwt.verify(token, JWT_SECRET);
    
    res.json({
      message: 'JWT is working correctly',
      token,
      decoded
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      message: 'JWT test failed',
      error: errorMessage
    });
  }
});

// MongoDB test endpoint
app.get('/api/mongodb-test', async (req, res) => {
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({
        message: 'MongoDB not connected',
        readyState: mongoose.connection.readyState
      });
    }
    
    // Get collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    res.json({
      message: 'MongoDB connection test successful',
      collections: collectionNames
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      message: 'MongoDB connection test failed',
      error: errorMessage
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ============================
// DATABASE CONNECTION
// ============================

async function connectToMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`Connected to MongoDB at ${MONGODB_URI}`);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name).join(', '));
    
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('MongoDB connection error:', errorMessage);
    return false;
  }
}

// ============================
// SERVER STARTUP
// ============================

async function startServer() {
  // Connect to MongoDB first
  const dbConnected = await connectToMongoDB();
  
  if (!dbConnected) {
    console.error('Failed to connect to MongoDB. Server will not start.');
    process.exit(1);
  }
  
  // Start Express server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Try these endpoints:`);
    console.log(`- http://localhost:${PORT}/api/health`);
    console.log(`- http://localhost:${PORT}/api/test`);
    console.log(`- http://localhost:${PORT}/api/test-jwt`);
    console.log(`- http://localhost:${PORT}/api/mongodb-test`);
  });
}

// Start the server
startServer();

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
}); 