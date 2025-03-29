/**
 * Script to initialize a default US Map document if one doesn't exist
 * CommonJS version for use in JavaScript files
 */
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Define USMap schema
const usMapSchema = new mongoose.Schema({
  name: { type: String, default: "US Map" },
  type: { type: String, default: "us_map" },
  metadata: {
    totalStates: { type: Number, default: 0 },
    totalCounties: { type: Number, default: 0 },
    totalProperties: { type: Number, default: 0 },
    statistics: {
      totalTaxLiens: { type: Number, default: 0 },
      totalValue: { type: Number, default: 0 }
    }
  },
  controllers: [{ 
    controllerId: mongoose.Schema.Types.ObjectId,
    controllerType: String,
    enabled: Boolean,
    lastRun: Date,
    nextScheduledRun: Date,
    configuration: mongoose.Schema.Types.Mixed
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'usmap' });

// Create model if it doesn't exist already
const USMap = mongoose.models.USMap || mongoose.model('USMap', usMapSchema, 'usmap');

// Connect to database
async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform';
  
  if (mongoose.connection.readyState !== 1) {
    console.log('Connecting to MongoDB...');
    
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('Connected to MongoDB');
      return true;
    } catch (error) {
      console.error('MongoDB connection error:', error);
      return false;
    }
  }
  
  return true;
}

/**
 * Initialize a US Map document if one doesn't exist
 */
async function initUSMap() {
  try {
    // Connect to database if not already connected
    await connectDB();
    
    console.log('Initializing US Map...');
    
    // Check if US Map exists
    const existingUSMap = await USMap.findOne({ type: 'us_map' });
    
    if (!existingUSMap) {
      console.log('US Map not found, creating default');
      
      // Create default US Map
      const newUSMap = new USMap({
        name: 'US Map',
        type: 'us_map',
        metadata: {
          totalStates: 0,
          totalCounties: 0,
          totalProperties: 0,
          statistics: {
            totalTaxLiens: 0,
            totalValue: 0
          }
        },
        controllers: []
      });
      
      // Save the new US Map
      await newUSMap.save();
      console.log('Default US Map created successfully');
      return newUSMap;
    } else {
      console.log('US Map already exists');
      return existingUSMap;
    }
  } catch (error) {
    console.error(`Error initializing US Map: ${error.message}`);
    // Don't throw the error, just log it - this allows the server to continue starting up
  } finally {
    // Close database connection if this script is run standalone
    if (process.env.STANDALONE === 'true') {
      await mongoose.connection.close();
    }
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  initUSMap()
    .then(() => {
      console.log('US Map initialization complete');
      process.exit(0);
    })
    .catch(error => {
      console.error(`Failed to initialize US Map: ${error}`);
      process.exit(1);
    });
}

// Export the function
module.exports = {
  initUSMap,
  connectDB
}; 