/**
 * Script to record a data collection run
 * 
 * Usage: node record-collection-run.js <sourceId> <propertyCount> <duration> <success> [errorMessage]
 */

const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

// Import TypeScript modules via ts-node/register
require('ts-node/register');
const { recordCollectionRun, getLatestCollectionRun, getCollectionRunStats } = require('../src/utils/collection-utils');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform';

// Generate sample properties
function generateSampleProperties(count) {
  const properties = [];
  for (let i = 0; i < count; i++) {
    const propertyId = new ObjectId();
    properties.push({
      _id: propertyId,
      parcelId: `TEST-${i.toString().padStart(5, '0')}`,
      address: {
        street: `${i + 100} Test Street`,
        city: 'Test City',
        state: 'TS',
        zipCode: '12345'
      }
    });
  }
  return properties;
}

// Main function
async function main() {
  console.log('Starting collection run recording...');
  
  // Get command line args
  const args = process.argv.slice(2);
  
  if (args.length < 4) {
    console.error('Usage: node record-collection-run.js <sourceId> <propertyCount> <duration> <success> [errorMessage]');
    process.exit(1);
  }
  
  const sourceId = args[0];
  const propertyCount = parseInt(args[1], 10);
  const duration = parseInt(args[2], 10);
  const success = args[3].toLowerCase() === 'true';
  const errorMessage = args[4] || (success ? null : 'Collection failed with sample error');
  
  if (isNaN(propertyCount) || propertyCount <= 0) {
    console.error('Property count must be a positive number');
    process.exit(1);
  }
  
  if (isNaN(duration) || duration <= 0) {
    console.error('Duration must be a positive number');
    process.exit(1);
  }
  
  if (!ObjectId.isValid(sourceId)) {
    console.error('Invalid source ID format. Must be a valid MongoDB ObjectId');
    process.exit(1);
  }
  
  try {
    // Connect to MongoDB
    console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Generate sample properties
    console.log(`Generating ${propertyCount} sample properties...`);
    const properties = generateSampleProperties(propertyCount);
    
    // Record collection run
    console.log(`Recording collection run for source ${sourceId}...`);
    console.log(`Status: ${success ? 'Success' : 'Error'}`);
    console.log(`Duration: ${duration}ms`);
    console.log(`Properties: ${properties.length}`);
    
    const collectionId = await recordCollectionRun(
      sourceId,
      properties,
      duration,
      success,
      errorMessage
    );
    
    console.log(`Collection run recorded with ID: ${collectionId}`);
    
    // Get the latest collection run
    console.log('\nRetrieving latest collection run...');
    const latestRun = await getLatestCollectionRun(sourceId);
    console.log('Latest Collection Run:');
    console.log(`- ID: ${latestRun._id}`);
    console.log(`- Timestamp: ${latestRun.timestamp}`);
    console.log(`- Status: ${latestRun.status}`);
    console.log(`- Items: ${latestRun.stats.itemCount}`);
    console.log(`- Duration: ${latestRun.stats.duration}ms`);
    
    // Get collection statistics
    console.log('\nRetrieving collection run statistics...');
    const stats = await getCollectionRunStats(sourceId);
    
    if (stats) {
      console.log('Collection Run Statistics:');
      console.log(`- Total Runs: ${stats.totalRuns}`);
      console.log(`- Success Rate: ${stats.successRate.toFixed(2)}%`);
      console.log(`- Average Duration: ${stats.averageDuration.toFixed(2)}ms`);
      console.log(`- Average Items: ${stats.averageItems.toFixed(2)}`);
    } else {
      console.log('No collection run statistics available');
    }
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
  }
}

// Run the main function
main(); 