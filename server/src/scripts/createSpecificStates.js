/**
 * Script for creating specific states with explicit IDs
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Set up MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform';

// Configure logger
const logger = {
  info: (msg) => console.log(`INFO: ${msg}`),
  error: (msg, err) => console.error(`ERROR: ${msg}`, err)
};

// Define State schema (simplified version of the actual schema)
const StateSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  abbreviation: { type: String, required: true },
  type: { type: String, required: true, default: 'state' },
  parentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  geometry: {
    type: { type: String, required: true },
    coordinates: { type: mongoose.Schema.Types.Mixed, required: true }
  },
  metadata: {
    totalCounties: { type: Number, default: 0 },
    totalProperties: { type: Number, default: 0 },
    statistics: {
      totalTaxLiens: { type: Number, default: 0 },
      totalValue: { type: Number, default: 0 },
      lastUpdated: { type: Date, default: Date.now }
    }
  }
}, { 
  timestamps: true
});

// Function to create the Florida state
const createFloridaState = async (parentId) => {
  try {
    const State = mongoose.model('State', StateSchema);
    
    // Check if Florida already exists
    const existingState = await State.findOne({ abbreviation: 'FL' });
    
    if (existingState) {
      logger.info('Florida state already exists');
      
      // Ensure it has an ID
      if (!existingState.id) {
        existingState.id = 'fl';
        await existingState.save();
        logger.info('Updated Florida state with ID: fl');
      }
      
      return existingState;
    }
    
    // Create Florida state with explicit ID
    const florida = new State({
      id: 'fl', // Explicitly provide id
      name: 'Florida',
      abbreviation: 'FL',
      type: 'state',
      parentId,
      geometry: {
        type: 'MultiPolygon',
        coordinates: [[[[
          [-87.6, 24.5],
          [-80.0, 24.5],
          [-80.0, 31.0],
          [-87.6, 31.0],
          [-87.6, 24.5]
        ]]]]
      },
      metadata: {
        totalCounties: 0,
        totalProperties: 0,
        statistics: {
          totalTaxLiens: 0,
          totalValue: 0,
          lastUpdated: new Date()
        }
      }
    });
    
    await florida.save();
    logger.info('Florida state created successfully with ID: fl');
    return florida;
  } catch (error) {
    logger.error(`Error creating Florida state: ${error.message}`);
    logger.error(error);
    throw error;
  }
};

// Function to create other states with explicit IDs
const createState = async (stateInfo, parentId) => {
  try {
    const State = mongoose.model('State', StateSchema);
    
    // Check if state already exists
    const existingState = await State.findOne({ abbreviation: stateInfo.abbreviation });
    
    if (existingState) {
      logger.info(`${stateInfo.name} state already exists`);
      
      // Ensure it has an ID
      if (!existingState.id) {
        existingState.id = stateInfo.abbreviation.toLowerCase();
        await existingState.save();
        logger.info(`Updated ${stateInfo.name} state with ID: ${existingState.id}`);
      }
      
      return existingState;
    }
    
    // Create state with explicit ID
    const state = new State({
      id: stateInfo.abbreviation.toLowerCase(),
      name: stateInfo.name,
      abbreviation: stateInfo.abbreviation,
      type: 'state',
      parentId,
      geometry: stateInfo.geometry,
      metadata: {
        totalCounties: 0,
        totalProperties: 0,
        statistics: {
          totalTaxLiens: 0,
          totalValue: 0,
          lastUpdated: new Date()
        }
      }
    });
    
    await state.save();
    logger.info(`${state.name} state created successfully with ID: ${state.id}`);
    return state;
  } catch (error) {
    logger.error(`Error creating ${stateInfo.name} state: ${error.message}`);
    logger.error(error);
    throw error;
  }
};

// Main function to create all required states
const createRequiredStates = async () => {
  try {
    // Connect to MongoDB
    logger.info('Connecting to MongoDB');
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB');
    
    // Get USMap ID to use as parentId
    const USMap = mongoose.models.USMap || mongoose.model('USMap', new mongoose.Schema({
      name: String,
      type: String
    }));
    
    let usMap = await USMap.findOne({ type: 'us_map' });
    
    if (!usMap) {
      logger.info('Creating US Map root object');
      usMap = await USMap.create({
        name: 'US Map',
        type: 'us_map'
      });
    }
    
    // Create Florida state with explicit ID
    await createFloridaState(usMap._id);
    
    // Create other states as needed
    const stateData = [
      {
        name: 'California',
        abbreviation: 'CA',
        geometry: {
          type: 'MultiPolygon',
          coordinates: [[[[
            [-124.4, 32.5],
            [-114.1, 32.5],
            [-114.1, 42.0],
            [-124.4, 42.0],
            [-124.4, 32.5]
          ]]]]
        }
      },
      {
        name: 'Texas',
        abbreviation: 'TX',
        geometry: {
          type: 'MultiPolygon',
          coordinates: [[[[
            [-106.6, 25.8],
            [-93.5, 25.8],
            [-93.5, 36.5],
            [-106.6, 36.5],
            [-106.6, 25.8]
          ]]]]
        }
      },
      {
        name: 'New York',
        abbreviation: 'NY',
        geometry: {
          type: 'MultiPolygon',
          coordinates: [[[[
            [-79.8, 40.5],
            [-71.9, 40.5],
            [-71.9, 45.0],
            [-79.8, 45.0],
            [-79.8, 40.5]
          ]]]]
        }
      },
      {
        name: 'Maryland',
        abbreviation: 'MD',
        geometry: {
          type: 'MultiPolygon',
          coordinates: [[[[
            [-79.5, 37.9],
            [-75.0, 37.9],
            [-75.0, 39.7],
            [-79.5, 39.7],
            [-79.5, 37.9]
          ]]]]
        }
      }
    ];
    
    for (const state of stateData) {
      await createState(state, usMap._id);
    }
    
    logger.info('All required states created successfully');
  } catch (error) {
    logger.error('Error in createRequiredStates:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
};

// Run the script
if (require.main === module) {
  createRequiredStates()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Script failed:', error);
      process.exit(1);
    });
} else {
  // Export for use in other scripts
  module.exports = {
    createFloridaState,
    createState,
    createRequiredStates
  };
} 