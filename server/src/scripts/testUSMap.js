/**
 * Test script to verify USMap initialization
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { initUSMap } = require('./initUSMap.cjs'); // Use the CommonJS version

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Connect to MongoDB
async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform';
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    return false;
  }
}

// Test function
async function testUSMap() {
  try {
    console.log('Starting USMap test...');
    
    // Connect to database
    const dbConnected = await connectToDatabase();
    if (!dbConnected) {
      throw new Error('Failed to connect to database');
    }
    
    // Run the initUSMap function
    await initUSMap();
    
    // Verify USMap exists
    const USMap = mongoose.model('USMap');
    const map = await USMap.findOne({ type: 'us_map' });
    
    if (map) {
      console.log('USMap found:', map.name);
      console.log('Creation date:', map.createdAt);
      console.log('Total states:', map.metadata.totalStates);
      console.log('Test successful!');
    } else {
      console.error('USMap not found after initialization');
    }
  } catch (error) {
    console.error('Error testing USMap:', error);
  } finally {
    // Close database connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testUSMap().then(() => {
  console.log('USMap test completed');
  process.exit(0);
}).catch(error => {
  console.error('USMap test failed:', error);
  process.exit(1);
}); 