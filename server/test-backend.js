/**
 * Simple backend test script
 * 
 * This script tests:
 * 1. MongoDB connection
 * 2. JWT functionality
 * 3. Basic API endpoints
 * 
 * Run with: node test-backend.js
 */

// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables (try multiple paths)
console.log('Loading environment variables...');
try {
  const result1 = dotenv.config({ path: '../.env' });
  console.log('Loading ../.env:', result1.error ? 'Failed' : 'Success');
  
  const result2 = dotenv.config({ path: './.env' });
  console.log('Loading ./.env:', result2.error ? 'Failed' : 'Success');
  
  // Also try loading from root
  const result3 = dotenv.config();
  console.log('Loading default .env:', result3.error ? 'Failed' : 'Success');
} catch (err) {
  console.error('Error loading .env files:', err);
}

// Set JWT_SECRET if not already set
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret-key-for-development-only';
  console.log('\x1b[33m%s\x1b[0m', 'WARNING: Using default JWT_SECRET. Set proper secret in production!');
}

// Store JWT_SECRET to ensure it's available
const JWT_SECRET = process.env.JWT_SECRET;

// Set MongoDB URI if not already set
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/real-estate-platform';
  console.log('\x1b[33m%s\x1b[0m', 'WARNING: Using default MongoDB URI.');
}

// Set server port
const PORT = process.env.PORT || 4200;

// Log environment
console.log('\nEnvironment:');
console.log('- MONGODB_URI:', process.env.MONGODB_URI);
console.log('- PORT:', PORT);
console.log('- NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('- JWT_SECRET:', JWT_SECRET ? 'Set ✓' : 'Not set ✗');

// Create Express app
const app = express();

// Configure middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// MongoDB connection test
async function testMongoDB() {
  console.log('\nTesting MongoDB connection...');
  try {
    // Log the MongoDB connection string (partially masked for security)
    const mongoUri = process.env.MONGODB_URI || '';
    const maskedUri = mongoUri.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:***@');
    console.log('Attempting to connect to:', maskedUri);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      // These options are no longer needed in newer Mongoose versions
      // but kept for backward compatibility
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('\x1b[32m%s\x1b[0m', '✓ MongoDB connection successful');
    console.log('Mongoose version:', mongoose.version);
    console.log('Connection state:', mongoose.connection.readyState);

    // Get all collection names
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nAvailable collections:');
    collections.forEach((collection, index) => {
      console.log(`${index + 1}. ${collection.name}`);
    });

    // Sample data from 'states' collection if it exists
    if (collections.some(c => c.name === 'states')) {
      console.log('\nSample states:');
      const states = await mongoose.connection.db.collection('states').find().limit(3).toArray();
      states.forEach((state, index) => {
        console.log(`${index + 1}. ${state.name} (${state.abbreviation}), ID: ${state._id}`);
      });
    }

    // Close connection
    return true;
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '✗ MongoDB connection error:');
    console.error(error);
    console.error('Error stack:', error.stack);
    
    // Check for specific MongoDB error codes
    if (error.name === 'MongoNetworkError') {
      console.error('\x1b[31m%s\x1b[0m', 'Network error - MongoDB server might not be running.');
    } else if (error.name === 'MongoServerSelectionError') {
      console.error('\x1b[31m%s\x1b[0m', 'Server selection error - Unable to select a server.');
    }
    
    return false;
  }
}

// JWT test
function testJWT() {
  console.log('\nTesting JWT functionality...');
  try {
    // Create a test payload
    const payload = {
      userId: '12345',
      email: 'test@example.com',
      role: 'user'
    };

    // Sign token
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    console.log('\x1b[32m%s\x1b[0m', '✓ JWT token created successfully');
    console.log('Token:', token.substring(0, 20) + '...');
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('\x1b[32m%s\x1b[0m', '✓ JWT token verified successfully');
    console.log('Decoded token:', decoded);
    
    return true;
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '✗ JWT test failed:');
    console.error(error);
    console.error('Error stack:', error.stack);
    return false;
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    server: 'test-backend'
  });
});

// JWT test endpoint
app.get('/jwt-test', (req, res) => {
  try {
    // Create a test payload
    const payload = {
      userId: '12345',
      email: 'test@example.com',
      role: 'user'
    };

    // Sign token
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    res.json({
      success: true,
      message: 'JWT functions properly',
      token,
      decoded
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'JWT test failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
  }
});

// MongoDB test endpoint
app.get('/mongodb-test', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
    
    // Get all collection names
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    // Count documents in each collection
    const collectionStats = await Promise.all(
      collections.map(async collection => {
        const count = await mongoose.connection.db.collection(collection.name).countDocuments();
        return {
          name: collection.name,
          count
        };
      })
    );
    
    res.json({
      success: true,
      message: 'MongoDB connection successful',
      readyState: mongoose.connection.readyState,
      collections: collectionStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'MongoDB test failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found'
  });
});

// Main function to run tests and start server
async function main() {
  console.log('\n=== BACKEND TEST SCRIPT ===');
  console.log('Current directory:', process.cwd());
  console.log('Node version:', process.version);
  console.log('Platform:', process.platform);
  
  try {
    // Test MongoDB connection
    const mongoResult = await testMongoDB();
    
    // Test JWT functionality
    const jwtResult = testJWT();
    
    // Report test results
    console.log('\nTest Results:');
    console.log('- MongoDB:', mongoResult ? '✓ Success' : '✗ Failed');
    console.log('- JWT:', jwtResult ? '✓ Success' : '✗ Failed');
    
    // Start server only if tests pass or explicitly requested
    if (mongoResult && jwtResult) {
      app.listen(PORT, () => {
        console.log(`\n\x1b[32m%s\x1b[0m`, `Server running on http://localhost:${PORT}`);
        console.log('\nAvailable endpoints:');
        console.log('- GET /health - Server health check');
        console.log('- GET /jwt-test - Test JWT functionality');
        console.log('- GET /mongodb-test - Test MongoDB connection');
        
        console.log('\nPress Ctrl+C to stop the server...');
      });
      
      // Setup graceful shutdown
      process.on('SIGINT', async () => {
        console.log('\nGracefully shutting down...');
        try {
          await mongoose.connection.close();
          console.log('MongoDB connection closed.');
        } catch (error) {
          console.error('Error closing MongoDB connection:', error);
        }
        process.exit(0);
      });
    } else {
      console.log('\n\x1b[31m%s\x1b[0m', 'Tests failed. Server not started.');
      
      // Clean up resources
      if (mongoose.connection.readyState !== 0) {
        try {
          await mongoose.connection.close();
          console.log('MongoDB connection closed.');
        } catch (error) {
          console.error('Error closing MongoDB connection:', error);
        }
      }
      
      // Exit with error code
      process.exit(1);
    }
  } catch (error) {
    console.error('\n\x1b[31m%s\x1b[0m', 'Uncaught error in main function:');
    console.error(error);
    console.error('Error stack:', error.stack);
    process.exit(1);
  }
}

// Set unhandled exception and rejection handlers
process.on('uncaughtException', (error) => {
  console.error('\n\x1b[31m%s\x1b[0m', 'UNCAUGHT EXCEPTION:');
  console.error(error);
  console.error('Error stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n\x1b[31m%s\x1b[0m', 'UNHANDLED PROMISE REJECTION:');
  console.error('Reason:', reason);
  console.error('Promise:', promise);
  process.exit(1);
});

// Run the main function
main().catch(error => {
  console.error('\n\x1b[31m%s\x1b[0m', 'Fatal error:');
  console.error(error);
  console.error('Error stack:', error.stack);
  process.exit(1);
}); 