/**
 * Test script to verify geographic data initialization
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs').promises;

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Import the geographic data initialization function dynamically
async function importGeoDataUtils() {
  try {
    // We need to use require here since we're in a CommonJS module
    const { initializeGeographicData } = require('../utils/geoDataUtils');
    return { initializeGeographicData };
  } catch (error) {
    console.error('Error importing geoDataUtils:', error);
    return {};
  }
}

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

// Test geographic data initialization
async function testGeoData() {
  try {
    console.log('Starting geographic data initialization test...');
    
    // Connect to database
    const dbConnected = await connectToDatabase();
    if (!dbConnected) {
      throw new Error('Failed to connect to database');
    }
    
    // Load models
    const USMap = mongoose.model('USMap', new mongoose.Schema({
      name: String,
      type: String,
      metadata: {
        totalStates: Number,
        totalCounties: Number,
        totalProperties: Number,
        statistics: {
          totalTaxLiens: Number,
          totalValue: Number
        }
      }
    }, { collection: 'usmap' }));
    
    const State = mongoose.model('State', new mongoose.Schema({
      name: String,
      abbreviation: String,
      type: String,
      parentId: mongoose.Schema.Types.ObjectId,
      geometry: Object,
      metadata: Object
    }));
    
    const County = mongoose.model('County', new mongoose.Schema({
      name: String,
      type: String,
      parentId: mongoose.Schema.Types.ObjectId,
      stateId: mongoose.Schema.Types.ObjectId,
      geometry: Object,
      metadata: Object
    }));
    
    // Import the geographic data initialization function
    const utils = await importGeoDataUtils();
    
    if (!utils.initializeGeographicData) {
      throw new Error('Failed to import initializeGeographicData function');
    }
    
    // Run the geographic data initialization
    await utils.initializeGeographicData();
    
    // Verify data was created
    const usMap = await USMap.findOne();
    const stateCount = await State.countDocuments();
    const countyCount = await County.countDocuments();
    
    console.log('Geographic data initialization results:');
    console.log('- US Map:', usMap ? 'Found' : 'Not found');
    console.log('- States created:', stateCount);
    console.log('- Counties created:', countyCount);
    
    if (usMap && stateCount > 0) {
      console.log('Test successful!');
    } else {
      console.log('Test partially successful - check logs for details');
    }
  } catch (error) {
    console.error('Error testing geographic data initialization:', error);
  } finally {
    // Close database connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testGeoData().then(() => {
  console.log('Geographic data test completed');
  process.exit(0);
}).catch(error => {
  console.error('Geographic data test failed:', error);
  process.exit(1);
}); 