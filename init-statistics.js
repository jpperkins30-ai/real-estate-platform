// Script to initialize and recalculate statistics for all entities
const { MongoClient, ObjectId } = require('mongodb');

// Connection URI
const uri = 'mongodb://localhost:27017/real-estate-platform';

/**
 * Initializes statistics fields for all entities
 */
async function initializeStatistics() {
  console.log('Starting statistics initialization...');
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('real-estate-platform');
    
    // Initialize county statistics
    console.log('\nInitializing county statistics...');
    const countyResult = await db.collection('counties').updateMany(
      { "metadata.statistics": { $exists: false } },
      { 
        $set: { 
          "metadata.statistics": {
            totalValue: 0,
            totalTaxLiens: 0
          }
        }
      }
    );
    
    console.log(`Counties initialized: ${countyResult.modifiedCount}`);
    
    // Initialize state statistics
    console.log('\nInitializing state statistics...');
    const stateResult = await db.collection('states').updateMany(
      { "metadata.statistics": { $exists: false } },
      { 
        $set: { 
          "metadata.statistics": {
            totalValue: 0,
            totalTaxLiens: 0
          }
        }
      }
    );
    
    console.log(`States initialized: ${stateResult.modifiedCount}`);
    
    // Initialize US Map statistics
    console.log('\nInitializing US Map statistics...');
    const usMapResult = await db.collection('usmaps').updateMany(
      { "metadata.statistics": { $exists: false } },
      { 
        $set: { 
          "metadata.statistics": {
            totalValue: 0,
            totalTaxLiens: 0
          }
        }
      }
    );
    
    console.log(`US Maps initialized: ${usMapResult.modifiedCount}`);
    
    // Also initialize the usmap collection (singular) if it exists
    const usMapSingularResult = await db.collection('usmap').updateMany(
      { "metadata.statistics": { $exists: false } },
      { 
        $set: { 
          "metadata.statistics": {
            totalValue: 0,
            totalTaxLiens: 0
          }
        }
      }
    );
    
    console.log(`Singular US Maps initialized: ${usMapSingularResult.modifiedCount}`);
    
    console.log('\nInitialization completed.');
    
  } catch (error) {
    console.error('Error initializing statistics:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

/**
 * Recalculates all statistics based on existing properties
 */
async function recalculateAllStatistics() {
  console.log('Starting statistics recalculation...');
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('real-estate-platform');
    
    // First, initialize statistics to zero
    await resetAllStatistics(db);
    
    // Get all properties
    const properties = await db.collection('properties').find({}).toArray();
    console.log(`Found ${properties.length} properties to process`);
    
    // Process each property
    let countyUpdates = {};
    let stateUpdates = {};
    let usMapUpdates = {
      totalProperties: 0,
      totalValue: 0,
      totalTaxLiens: 0
    };
    
    for (const property of properties) {
      console.log(`Processing property: ${property.address?.formatted || property._id}`);
      
      const marketValue = property.metadata?.marketValue || 0;
      const isDelinquent = property.metadata?.taxStatus === "Delinquent";
      
      // Update county statistics
      if (property.countyId) {
        const countyId = property.countyId.toString();
        
        if (!countyUpdates[countyId]) {
          countyUpdates[countyId] = {
            totalProperties: 0,
            totalValue: 0,
            totalTaxLiens: 0
          };
        }
        
        countyUpdates[countyId].totalProperties += 1;
        countyUpdates[countyId].totalValue += marketValue;
        
        if (isDelinquent) {
          countyUpdates[countyId].totalTaxLiens += 1;
        }
      }
      
      // Update state statistics
      if (property.stateId) {
        const stateId = property.stateId.toString();
        
        if (!stateUpdates[stateId]) {
          stateUpdates[stateId] = {
            totalProperties: 0,
            totalValue: 0,
            totalTaxLiens: 0
          };
        }
        
        stateUpdates[stateId].totalProperties += 1;
        stateUpdates[stateId].totalValue += marketValue;
        
        if (isDelinquent) {
          stateUpdates[stateId].totalTaxLiens += 1;
        }
      }
      
      // Update US Map statistics
      usMapUpdates.totalProperties += 1;
      usMapUpdates.totalValue += marketValue;
      
      if (isDelinquent) {
        usMapUpdates.totalTaxLiens += 1;
      }
    }
    
    // Apply updates to counties
    console.log('\nUpdating county statistics...');
    for (const countyId in countyUpdates) {
      const update = countyUpdates[countyId];
      
      await db.collection('counties').updateOne(
        { _id: new ObjectId(countyId) },
        { 
          $set: { 
            "metadata.totalProperties": update.totalProperties,
            "metadata.statistics.totalValue": update.totalValue,
            "metadata.statistics.totalTaxLiens": update.totalTaxLiens
          }
        }
      );
      
      console.log(`Updated county ${countyId}: ${JSON.stringify(update)}`);
    }
    
    // Apply updates to states
    console.log('\nUpdating state statistics...');
    for (const stateId in stateUpdates) {
      const update = stateUpdates[stateId];
      
      await db.collection('states').updateOne(
        { _id: new ObjectId(stateId) },
        { 
          $set: { 
            "metadata.totalProperties": update.totalProperties,
            "metadata.statistics.totalValue": update.totalValue,
            "metadata.statistics.totalTaxLiens": update.totalTaxLiens
          }
        }
      );
      
      console.log(`Updated state ${stateId}: ${JSON.stringify(update)}`);
    }
    
    // Apply updates to US Map
    console.log('\nUpdating US Map statistics...');
    
    const usMap = await db.collection('usmaps').findOne({ type: "us_map" });
    if (usMap) {
      await db.collection('usmaps').updateOne(
        { _id: usMap._id },
        { 
          $set: { 
            "metadata.totalProperties": usMapUpdates.totalProperties,
            "metadata.statistics.totalValue": usMapUpdates.totalValue,
            "metadata.statistics.totalTaxLiens": usMapUpdates.totalTaxLiens
          }
        }
      );
      
      console.log(`Updated US Map: ${JSON.stringify(usMapUpdates)}`);
    }
    
    // Also update the usmap collection (singular) if it exists
    const usMapSingular = await db.collection('usmap').findOne({ type: "us_map" });
    if (usMapSingular) {
      await db.collection('usmap').updateOne(
        { _id: usMapSingular._id },
        { 
          $set: { 
            "metadata.totalProperties": usMapUpdates.totalProperties,
            "metadata.statistics.totalValue": usMapUpdates.totalValue,
            "metadata.statistics.totalTaxLiens": usMapUpdates.totalTaxLiens
          }
        }
      );
      
      console.log(`Updated singular US Map: ${JSON.stringify(usMapUpdates)}`);
    }
    
    // Update county counts in states
    console.log('\nUpdating county counts in states...');
    const states = await db.collection('states').find({}).toArray();
    
    for (const state of states) {
      const countyCount = await db.collection('counties').countDocuments({ stateId: state._id });
      
      await db.collection('states').updateOne(
        { _id: state._id },
        { $set: { "metadata.totalCounties": countyCount } }
      );
      
      console.log(`Updated state ${state.name}: ${countyCount} counties`);
    }
    
    // Update state and county counts in US Map
    console.log('\nUpdating state and county counts in US Map...');
    
    const stateCount = await db.collection('states').countDocuments();
    const countyCount = await db.collection('counties').countDocuments();
    
    if (usMap) {
      await db.collection('usmaps').updateOne(
        { _id: usMap._id },
        { 
          $set: { 
            "metadata.totalStates": stateCount,
            "metadata.totalCounties": countyCount
          }
        }
      );
      
      console.log(`Updated US Map: ${stateCount} states, ${countyCount} counties`);
    }
    
    if (usMapSingular) {
      await db.collection('usmap').updateOne(
        { _id: usMapSingular._id },
        { 
          $set: { 
            "metadata.totalStates": stateCount,
            "metadata.totalCounties": countyCount
          }
        }
      );
      
      console.log(`Updated singular US Map: ${stateCount} states, ${countyCount} counties`);
    }
    
    console.log('\nRecalculation completed successfully');
    
  } catch (error) {
    console.error('Error recalculating statistics:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

/**
 * Resets all statistics to zero
 * @param {Object} db - MongoDB database instance
 */
async function resetAllStatistics(db) {
  console.log('Resetting all statistics to zero...');
  
  // Reset county statistics
  await db.collection('counties').updateMany(
    {},
    { 
      $set: { 
        "metadata.totalProperties": 0,
        "metadata.statistics.totalValue": 0,
        "metadata.statistics.totalTaxLiens": 0
      }
    }
  );
  
  // Reset state statistics
  await db.collection('states').updateMany(
    {},
    { 
      $set: { 
        "metadata.totalProperties": 0,
        "metadata.statistics.totalValue": 0,
        "metadata.statistics.totalTaxLiens": 0
      }
    }
  );
  
  // Reset US Map statistics
  await db.collection('usmaps').updateMany(
    {},
    { 
      $set: { 
        "metadata.totalProperties": 0,
        "metadata.statistics.totalValue": 0,
        "metadata.statistics.totalTaxLiens": 0
      }
    }
  );
  
  // Reset singular US Map statistics
  await db.collection('usmap').updateMany(
    {},
    { 
      $set: { 
        "metadata.totalProperties": 0,
        "metadata.statistics.totalValue": 0,
        "metadata.statistics.totalTaxLiens": 0
      }
    }
  );
  
  console.log('All statistics reset to zero');
}

// Export functions for use in other modules
module.exports = { 
  initializeStatistics,
  recalculateAllStatistics,
  resetAllStatistics
};

// If running this script directly, provide options to run specific functions
if (require.main === module) {
  console.log('Script started');
  
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  
  switch (command) {
    case 'init':
      initializeStatistics()
        .then(() => console.log('Initialization completed'))
        .catch(err => console.error('Initialization failed:', err));
      break;
      
    case 'recalculate':
      recalculateAllStatistics()
        .then(() => console.log('Recalculation completed'))
        .catch(err => console.error('Recalculation failed:', err));
      break;
      
    case 'reset':
      const MongoClient = require('mongodb').MongoClient;
      const client = new MongoClient(uri);
      
      client.connect()
        .then(async () => {
          const db = client.db('real-estate-platform');
          await resetAllStatistics(db);
          console.log('Reset completed');
        })
        .catch(err => console.error('Reset failed:', err))
        .finally(() => client.close());
      break;
      
    case 'help':
    default:
      console.log('Available commands:');
      console.log('  init        - Initialize statistics fields for all entities');
      console.log('  recalculate - Recalculate all statistics based on existing properties');
      console.log('  reset       - Reset all statistics to zero');
      console.log('  help        - Show this help message');
      console.log('\nUsage: node init-statistics.js <command>');
      break;
  }
} 