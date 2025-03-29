// Script to initialize a default US Map document if one doesn't exist
const mongoose = require('mongoose');
const USMap = require('../models/usmap.model');
const logger = require('../utils/logger');
const connectDB = require('../config/database');

const initUSMap = async () => {
  try {
    // Check if database connection is established, if not, connect
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    
    // Check if a US Map document already exists
    const existingMap = await USMap.findOne({ type: 'us_map' });
    
    if (existingMap) {
      logger.info('US Map document already exists');
      return existingMap;
    }
    
    // Create a new US Map document with default values
    const newUSMap = new USMap({
      name: 'US Map',
      type: 'us_map',
      geometry: {
        type: 'MultiPolygon',
        coordinates: []
      },
      metadata: {
        totalStates: 0,
        totalCounties: 0,
        totalProperties: 0,
        statistics: {
          totalTaxLiens: 0,
          totalValue: 0
        }
      }
    });
    
    // Save the new document
    await newUSMap.save();
    
    logger.info('Created new US Map document');
    return newUSMap;
  } catch (error) {
    logger.error(`Error initializing US Map: ${error.message}`);
    throw error;
  }
};

// Run the function if this script is executed directly
if (require.main === module) {
  initUSMap()
    .then(() => {
      logger.info('US Map initialization complete');
      process.exit(0);
    })
    .catch(error => {
      logger.error(`Failed to initialize US Map: ${error.message}`);
      process.exit(1);
    });
}

module.exports = initUSMap; 