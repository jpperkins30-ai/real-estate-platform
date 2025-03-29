/**
 * Simple test server to verify JWT configuration
 * 
 * Usage: node test-server.js
 */

require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Create Express app
const app = express();
const PORT = 4001; // Use a different port to avoid conflicts

// Check JWT configuration
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');

// Test JWT token generation
let testToken;
try {
  testToken = jwt.sign({ test: 'success' }, process.env.JWT_SECRET || 'default-secret');
  console.log('JWT Token Generation: ✓');
} catch (error) {
  console.error('JWT Token Generation Error:', error.message);
  process.exit(1);
}

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform';
console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected: ✓');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Test server running on port ${PORT}`);
      console.log(`Try these endpoints:`);
      console.log(`- http://localhost:${PORT}/api/health`);
      console.log(`- http://localhost:${PORT}/api/test-jwt`);
      console.log(`- http://localhost:${PORT}/api/mongodb-status`);
    });
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  });

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// JWT test endpoint
app.get('/api/test-jwt', (req, res) => {
  try {
    const token = jwt.sign({ test: 'success' }, process.env.JWT_SECRET || 'default-secret');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    
    res.json({
      success: true,
      message: 'JWT is working correctly',
      token,
      decoded
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'JWT error',
      error: error.message
    });
  }
});

// MongoDB status endpoint
app.get('/api/mongodb-status', async (req, res) => {
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({
        success: false,
        message: 'MongoDB not connected',
        readyState: mongoose.connection.readyState
      });
    }
    
    // Get collection info
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Try to get some counts
    const counts = {};
    for (const name of collectionNames) {
      counts[name] = await db.collection(name).countDocuments();
    }
    
    res.json({
      success: true,
      message: 'MongoDB is connected',
      collections: collectionNames,
      documentCounts: counts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'MongoDB error',
      error: error.message
    });
  }
}); 