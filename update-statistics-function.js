// Script to implement property statistics update function
const { MongoClient, ObjectId } = require('mongodb');

// Connection URI
const uri = 'mongodb://localhost:27017/real-estate-platform';

/**
 * Updates statistics after adding a new property
 * @param {string} propertyId - The ID of the newly added property
 * @returns {Promise<void>}
 */
async function updateStatisticsAfterAddingProperty(propertyId) {
  console.log(`Starting statistics update for property: ${propertyId}`);
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('real-estate-platform');
    
    // Get property
    const property = await db.collection('properties').findOne({ _id: new ObjectId(propertyId) });
    
    if (!property) {
      console.error(`Property not found with ID: ${propertyId}`);
      return;
    }
    
    console.log(`Found property: ${property.address ? property.address.formatted : 'Unknown'}`);
    
    // Initialize statistics objects if they don't exist
    await initializeStatisticsIfNeeded(db, property);
    
    // Update county statistics
    if (property.countyId) {
      console.log(`Updating county statistics for county ID: ${property.countyId}`);
      
      const updateResult = await db.collection('counties').updateOne(
        { _id: property.countyId },
        { 
          $inc: { 
            "metadata.totalProperties": 1,
            "metadata.statistics.totalValue": property.metadata?.marketValue || 0
          }
        }
      );
      
      console.log(`County update result: ${updateResult.modifiedCount === 1 ? 'Success' : 'Failed'}`);
      
      // If property has tax liens, update that statistic
      if (property.metadata?.taxStatus === "Delinquent") {
        console.log('Property is delinquent, updating tax lien statistics for county');
        
        const taxLienResult = await db.collection('counties').updateOne(
          { _id: property.countyId },
          { $inc: { "metadata.statistics.totalTaxLiens": 1 } }
        );
        
        console.log(`County tax lien update result: ${taxLienResult.modifiedCount === 1 ? 'Success' : 'Failed'}`);
      }
    }
    
    // Update state statistics
    if (property.stateId) {
      console.log(`Updating state statistics for state ID: ${property.stateId}`);
      
      const stateUpdateResult = await db.collection('states').updateOne(
        { _id: property.stateId },
        { 
          $inc: { 
            "metadata.totalProperties": 1,
            "metadata.statistics.totalValue": property.metadata?.marketValue || 0
          }
        }
      );
      
      console.log(`State update result: ${stateUpdateResult.modifiedCount === 1 ? 'Success' : 'Failed'}`);
      
      if (property.metadata?.taxStatus === "Delinquent") {
        console.log('Property is delinquent, updating tax lien statistics for state');
        
        const stateTaxLienResult = await db.collection('states').updateOne(
          { _id: property.stateId },
          { $inc: { "metadata.statistics.totalTaxLiens": 1 } }
        );
        
        console.log(`State tax lien update result: ${stateTaxLienResult.modifiedCount === 1 ? 'Success' : 'Failed'}`);
      }
    }
    
    // Update US Map statistics
    console.log('Updating US Map statistics');
    const usMap = await db.collection('usmaps').findOne({ type: "us_map" });
    
    if (usMap) {
      const usMapUpdateResult = await db.collection('usmaps').updateOne(
        { _id: usMap._id },
        { 
          $inc: { 
            "metadata.totalProperties": 1,
            "metadata.statistics.totalValue": property.metadata?.marketValue || 0
          }
        }
      );
      
      console.log(`US Map update result: ${usMapUpdateResult.modifiedCount === 1 ? 'Success' : 'Failed'}`);
      
      if (property.metadata?.taxStatus === "Delinquent") {
        console.log('Property is delinquent, updating tax lien statistics for US Map');
        
        const usMapTaxLienResult = await db.collection('usmaps').updateOne(
          { _id: usMap._id },
          { $inc: { "metadata.statistics.totalTaxLiens": 1 } }
        );
        
        console.log(`US Map tax lien update result: ${usMapTaxLienResult.modifiedCount === 1 ? 'Success' : 'Failed'}`);
      }
    }
    
    // Also update the usmap collection (singular) if it exists
    const usMapSingular = await db.collection('usmap').findOne({ type: "us_map" });
    
    if (usMapSingular) {
      console.log('Updating singular US Map statistics');
      
      const usMapSingularUpdateResult = await db.collection('usmap').updateOne(
        { _id: usMapSingular._id },
        { 
          $inc: { 
            "metadata.totalProperties": 1,
            "metadata.statistics.totalValue": property.metadata?.marketValue || 0
          }
        }
      );
      
      console.log(`Singular US Map update result: ${usMapSingularUpdateResult.modifiedCount === 1 ? 'Success' : 'Failed'}`);
      
      if (property.metadata?.taxStatus === "Delinquent") {
        console.log('Property is delinquent, updating tax lien statistics for singular US Map');
        
        const usMapSingularTaxLienResult = await db.collection('usmap').updateOne(
          { _id: usMapSingular._id },
          { $inc: { "metadata.statistics.totalTaxLiens": 1 } }
        );
        
        console.log(`Singular US Map tax lien update result: ${usMapSingularTaxLienResult.modifiedCount === 1 ? 'Success' : 'Failed'}`);
      }
    }
    
    console.log('Statistics update completed successfully');
    
  } catch (error) {
    console.error('Error updating statistics:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

/**
 * Initializes statistics objects if they don't exist
 * @param {Object} db - MongoDB database instance
 * @param {Object} property - Property document
 */
async function initializeStatisticsIfNeeded(db, property) {
  // Initialize county statistics if needed
  if (property.countyId) {
    await db.collection('counties').updateOne(
      { 
        _id: property.countyId,
        "metadata.statistics": { $exists: false }
      },
      { 
        $set: { 
          "metadata.statistics": {
            totalValue: 0,
            totalTaxLiens: 0
          }
        }
      }
    );
  }
  
  // Initialize state statistics if needed
  if (property.stateId) {
    await db.collection('states').updateOne(
      { 
        _id: property.stateId,
        "metadata.statistics": { $exists: false }
      },
      { 
        $set: { 
          "metadata.statistics": {
            totalValue: 0,
            totalTaxLiens: 0
          }
        }
      }
    );
  }
  
  // Initialize US Map statistics if needed
  await db.collection('usmaps').updateOne(
    { 
      type: "us_map",
      "metadata.statistics": { $exists: false }
    },
    { 
      $set: { 
        "metadata.statistics": {
          totalValue: 0,
          totalTaxLiens: 0
        }
      }
    }
  );
  
  // Initialize singular US Map statistics if needed
  await db.collection('usmap').updateOne(
    { 
      type: "us_map",
      "metadata.statistics": { $exists: false }
    },
    { 
      $set: { 
        "metadata.statistics": {
          totalValue: 0,
          totalTaxLiens: 0
        }
      }
    }
  );
}

// Export the function for use in other modules
module.exports = { updateStatisticsAfterAddingProperty };

// If running this script directly, provide a way to test the function
if (require.main === module) {
  console.log('Script started');
  
  // Check if a property ID was provided as an argument
  const propertyId = process.argv[2];
  
  if (!propertyId) {
    console.log('Please provide a property ID as an argument');
    console.log('Usage: node update-statistics-function.js <propertyId>');
  } else {
    updateStatisticsAfterAddingProperty(propertyId)
      .then(() => console.log('Function executed'))
      .catch(err => console.error('Function failed:', err));
  }
} 