/**
 * Script to detach a controller from a county
 * 
 * Usage: node detach-controller-from-county.js <controllerId> <countyId>
 */

const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

// Import TypeScript modules via ts-node/register
require('ts-node/register');
const { detachControllerFromCounty } = require('../src/utils/controller-utils');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform';

// Main function
async function main() {
  console.log('Starting controller detachment script...');
  
  // Get command line args
  const args = process.argv.slice(2);
  
  if (args.length !== 2) {
    console.error('Usage: node detach-controller-from-county.js <controllerId> <countyId>');
    process.exit(1);
  }
  
  const controllerId = args[0];
  const countyId = args[1];
  
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
    
    console.log(`Detaching controller ${controllerId} from county ${countyId}...`);
    
    // Perform detachment
    const result = await detachControllerFromCounty(controllerId, countyId);
    
    if (result) {
      console.log('SUCCESS: Controller successfully detached from county');
    } else {
      console.error('FAILED: Could not detach controller from county');
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