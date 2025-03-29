/**
 * Script to run scheduled collections
 * 
 * Usage: node run-scheduled-collections.js [--force]
 */

const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

// Import TypeScript modules via ts-node/register
require('ts-node/register');
const { runScheduledCollections, findDueDataSources } = require('../src/utils/scheduler-utils');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform';

// Mock collector function - in production this would call real collectors
async function mockCollector(dataSource) {
  console.log(`Simulating collection for "${dataSource.name}" (${dataSource._id})`);
  
  // Simulate processing time
  const startTime = Date.now();
  const processingTime = Math.floor(Math.random() * 1000) + 500; // 500-1500ms
  
  await new Promise(resolve => setTimeout(resolve, processingTime));
  
  // Generate random properties (1-5)
  const propertyCount = Math.floor(Math.random() * 5) + 1;
  const properties = [];
  
  for (let i = 0; i < propertyCount; i++) {
    properties.push({
      _id: new ObjectId(),
      parcelId: `${dataSource.name.substring(0, 3).toUpperCase()}-${i.toString().padStart(5, '0')}`,
      address: {
        street: `${i + 100} ${dataSource.name} Street`,
        city: `${dataSource.region.county || dataSource.region.state} City`,
        state: dataSource.region.state,
        zipCode: '12345'
      }
    });
  }
  
  // 90% chance of success
  const success = Math.random() < 0.9;
  const duration = Date.now() - startTime;
  
  return {
    properties,
    duration,
    success,
    errorMessage: success ? undefined : 'Simulated collection failure'
  };
}

// Main function
async function main() {
  console.log('Starting scheduled collections...');
  
  // Check for --force flag
  const forceRun = process.argv.includes('--force');
  
  try {
    // Connect to MongoDB
    console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    if (forceRun) {
      console.log('Forcing collection for all active data sources');
      
      // Override the findDueDataSources function for this run only
      const originalFindDueDataSources = findDueDataSources;
      
      // Mock the findDueDataSources to return all active data sources
      global.findDueDataSources = async () => {
        // Get all active sources
        const DataSource = mongoose.model('DataSource');
        return await DataSource.find({ status: { $ne: 'inactive' } });
      };
      
      // Run with forced mock
      const results = await runScheduledCollections(mockCollector);
      
      // Restore original function
      global.findDueDataSources = originalFindDueDataSources;
      
      console.log(`\nForced collection complete: ${results.length} data sources processed`);
    } else {
      // Normal run - only sources that are due
      const results = await runScheduledCollections(mockCollector);
      console.log(`\nScheduled collection complete: ${results.length} data sources processed`);
    }
    
    // Display detailed results
    const DataSource = mongoose.model('DataSource');
    const Collection = mongoose.model('Collection');
    
    console.log('\n=== COLLECTION SUMMARY ===');
    
    // Get recent collections (last 10)
    const recentCollections = await Collection.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('sourceId');
    
    console.log(`\nRecent collections: ${recentCollections.length}`);
    
    for (const collection of recentCollections) {
      console.log(`\nCollection ID: ${collection._id}`);
      console.log(`Source: ${collection.sourceId.name} (${collection.sourceId._id})`);
      console.log(`Timestamp: ${collection.timestamp}`);
      console.log(`Status: ${collection.status}`);
      console.log(`Properties: ${collection.properties.length}`);
      console.log(`Duration: ${collection.stats.duration}ms`);
      
      if (collection.status === 'error' && collection.errorLog.length > 0) {
        console.log(`Error: ${collection.errorLog[0].message}`);
      }
    }
    
    // Get next scheduled runs
    const nextRuns = await DataSource.find({ 
      nextScheduledRun: { $exists: true, $ne: null }
    })
    .sort({ nextScheduledRun: 1 })
    .limit(5);
    
    console.log('\n=== UPCOMING SCHEDULED RUNS ===');
    
    for (const source of nextRuns) {
      console.log(`${source.name} (${source._id}): ${source.nextScheduledRun}`);
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