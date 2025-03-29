// Simple script to test the USMap model
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const path = require('path');

// Set default values if env vars not found
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform';
const JWT_SECRET = process.env.JWT_SECRET || 'real-estate-platform-dev-secret-key-2025';

// Print environment variables
console.log('Environment:');
console.log('- MONGODB_URI:', MONGODB_URI);
console.log('- JWT_SECRET:', JWT_SECRET ? 'SET' : 'NOT SET');

async function testUSMapModel() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Print available collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name).join(', '));
    
    // Check if USMap JavaScript model exists
    try {
      const USMapJS = require('./models/usmap.model');
      console.log('JavaScript USMap model exists:', !!USMapJS);
      
      if (USMapJS && typeof USMapJS === 'object') {
        console.log('Model properties:', Object.keys(USMapJS));
        
        // Try to find a USMap document using JS model
        if (typeof USMapJS.findOne === 'function') {
          console.log('Attempting to find USMap with JS model...');
          const usMapJS = await USMapJS.findOne({ type: 'us_map' });
          console.log('USMap found with JS model:', !!usMapJS);
          if (usMapJS) {
            console.log('USMap data:', JSON.stringify(usMapJS, null, 2));
          }
        } else {
          console.log('findOne is not a function on USMapJS');
        }
      }
    } catch (jsError) {
      console.error('Error with JavaScript model:', jsError.message);
    }
    
    // Check if usmap collection exists
    const usmapCollection = collections.find(c => c.name === 'usmap');
    if (usmapCollection) {
      console.log('Usmap collection exists');
      
      // Query the collection directly
      const usmapDocs = await mongoose.connection.db.collection('usmap').find({}).toArray();
      console.log('Direct query found', usmapDocs.length, 'documents');
      if (usmapDocs.length > 0) {
        console.log('First document:', JSON.stringify(usmapDocs[0], null, 2));
      }
    } else {
      console.log('Usmap collection does not exist');
    }
    
  } catch (error) {
    if (error instanceof Error) {
      console.error('Test failed:', error.message);
    } else {
      console.error('Test failed with unknown error');
    }
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the test
testUSMapModel().catch(err => {
  if (err instanceof Error) {
    console.error('Unhandled error:', err.message);
  } else {
    console.error('Unhandled unknown error');
  }
  process.exit(1);
}); 