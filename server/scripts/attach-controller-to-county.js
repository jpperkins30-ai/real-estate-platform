/**
 * Script to attach a controller to a county
 * 
 * Usage: node attach-controller-to-county.js <controllerId> <countyId> <configFilePath>
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { ObjectId } = require('mongodb');

// Import TypeScript modules via ts-node/register
require('ts-node/register');
const { attachControllerToCounty } = require('../src/utils/controller-utils');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform';

// Main function
async function main() {
  console.log('Starting controller attachment script...');
  
  // Get command line args
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node attach-controller-to-county.js <controllerId> <countyId> [configFilePath]');
    process.exit(1);
  }
  
  const controllerId = args[0];
  const countyId = args[1];
  const configFilePath = args[2];
  
  let configuration = {};
  
  // If config file is provided, load it
  if (configFilePath) {
    try {
      const configContent = fs.readFileSync(
        path.resolve(process.cwd(), configFilePath),
        'utf-8'
      );
      configuration = JSON.parse(configContent);
      console.log('Loaded configuration from file:', configFilePath);
    } catch (error) {
      console.error('Error loading configuration file:', error.message);
      process.exit(1);
    }
  }
  
  try {
    // Connect to MongoDB
    console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Validate IDs
    if (!ObjectId.isValid(controllerId) || !ObjectId.isValid(countyId)) {
      console.error('Invalid ID format. Both controller and county IDs must be valid MongoDB ObjectIds');
      process.exit(1);
    }
    
    console.log(`Attaching controller ${controllerId} to county ${countyId}...`);
    
    // Perform attachment
    const result = await attachControllerToCounty(controllerId, countyId, configuration);
    
    if (result) {
      console.log('SUCCESS: Controller successfully attached to county');
    } else {
      console.error('FAILED: Could not attach controller to county');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the main function
main(); 