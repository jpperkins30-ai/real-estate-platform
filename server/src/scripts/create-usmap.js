// Simple script to create a US Map document
const mongoose = require('mongoose');
const USMap = require('../models/usmap.model');
const connectDB = require('../config/database');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function createUSMap() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    
    console.log('Checking for existing US Map...');
    const existingMap = await USMap.findOne({ type: 'us_map' });
    
    if (existingMap) {
      console.log('US Map already exists:');
      console.log(existingMap);
      return;
    }
    
    console.log('Creating new US Map...');
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
    
    await newUSMap.save();
    console.log('US Map created successfully:');
    console.log(newUSMap);
  } catch (error) {
    console.error('Error creating US Map:', error.message);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the function
createUSMap()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 