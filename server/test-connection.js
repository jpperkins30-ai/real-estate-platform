/**
 * Script to test MongoDB connection and JWT configuration
 * 
 * Usage: node test-connection.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform';

// Check environment variables
console.log('Checking environment variables...');
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET environment variable is not set.');
  console.error('Please check your .env file or set it in your environment.');
} else {
  console.log('JWT_SECRET: ✓');
  
  // Test JWT token creation
  try {
    const testToken = jwt.sign({ test: 'success' }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '24h' });
    console.log('JWT Token Generation: ✓');
    
    // Verify the token
    const decoded = jwt.verify(testToken, process.env.JWT_SECRET);
    console.log('JWT Token Verification: ✓');
    console.log('JWT Configuration is working properly.');
  } catch (error) {
    console.error('JWT Error:', error.message);
  }
}

// Test MongoDB connection
async function testMongoConnection() {
  console.log(`\nTesting MongoDB connection to ${MONGODB_URI}...`);
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connection: ✓');
    
    // List available collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nAvailable collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Count documents in each collection
    console.log('\nCollection statistics:');
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`- ${collection.name}: ${count} documents`);
    }
    
    console.log('\nDatabase connection test complete.');
  } catch (error) {
    console.error('MongoDB Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

// Run tests
async function runTests() {
  await testMongoConnection();
  
  console.log('\nSystem check summary:');
  console.log('====================');
  console.log('JWT Configuration: ' + (process.env.JWT_SECRET ? 'OK' : 'FAILED'));
  console.log('Database Connection: Completed test');
  console.log('\nIf all tests passed, your server should be able to start properly.');
  console.log('Run "npm run dev" to start the server.');
}

runTests(); 