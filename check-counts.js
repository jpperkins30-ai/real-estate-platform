// Script to check and update counts in US Map
const { MongoClient, ObjectId } = require('mongodb');

// Connection URI
const uri = 'mongodb://localhost:27017/real-estate-platform';

async function checkCounts() {
  const client = new MongoClient(uri);
  
  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected to MongoDB');
    
    // Get the database
    const db = client.db('real-estate-platform');
    
    // Count states
    const stateCount = await db.collection('states').countDocuments();
    console.log(`Total states in database: ${stateCount}`);
    
    // Count counties
    const countyCount = await db.collection('counties').countDocuments();
    console.log(`Total counties in database: ${countyCount}`);
    
    // Count properties
    const propertyCount = await db.collection('properties').countDocuments();
    console.log(`Total properties in database: ${propertyCount}`);
    
    // Get US Map from usmaps collection
    const usMap = await db.collection('usmaps').findOne({ type: "us_map" });
    if (usMap) {
      console.log('\nUS Map in usmaps collection:');
      console.log(`- ID: ${usMap._id}`);
      if (usMap.metadata) {
        console.log(`- Current state count: ${usMap.metadata.totalStates || 0}`);
        console.log(`- Current county count: ${usMap.metadata.totalCounties || 0}`);
        console.log(`- Current property count: ${usMap.metadata.totalProperties || 0}`);
        
        // Update if counts don't match
        if (usMap.metadata.totalStates !== stateCount || 
            usMap.metadata.totalCounties !== countyCount || 
            usMap.metadata.totalProperties !== propertyCount) {
          
          console.log("\nUpdating US Map counts in usmaps collection...");
          const updateResult = await db.collection('usmaps').updateOne(
            { _id: usMap._id },
            { 
              $set: { 
                "metadata.totalStates": stateCount,
                "metadata.totalCounties": countyCount,
                "metadata.totalProperties": propertyCount 
              } 
            }
          );
          console.log(`Update result: ${updateResult.modifiedCount === 1 ? "Success" : "No changes needed"}`);
        } else {
          console.log("\nUS Map counts are up to date in usmaps collection.");
        }
      } else {
        console.log("- No metadata available, initializing...");
        const initResult = await db.collection('usmaps').updateOne(
          { _id: usMap._id },
          { 
            $set: { 
              metadata: {
                totalStates: stateCount,
                totalCounties: countyCount,
                totalProperties: propertyCount
              } 
            } 
          }
        );
        console.log(`Initialization result: ${initResult.modifiedCount === 1 ? "Success" : "Failed"}`);
      }
    } else {
      console.log("No US Map found in usmaps collection");
    }
    
    // Get US Map from usmap collection
    const usMapSingular = await db.collection('usmap').findOne({ type: "us_map" });
    if (usMapSingular) {
      console.log('\nUS Map in usmap collection:');
      console.log(`- ID: ${usMapSingular._id}`);
      if (usMapSingular.metadata) {
        console.log(`- Current state count: ${usMapSingular.metadata.totalStates || 0}`);
        console.log(`- Current county count: ${usMapSingular.metadata.totalCounties || 0}`);
        console.log(`- Current property count: ${usMapSingular.metadata.totalProperties || 0}`);
        
        // Update if counts don't match
        if (usMapSingular.metadata.totalStates !== stateCount || 
            usMapSingular.metadata.totalCounties !== countyCount || 
            usMapSingular.metadata.totalProperties !== propertyCount) {
          
          console.log("\nUpdating US Map counts in usmap collection...");
          const updateResult = await db.collection('usmap').updateOne(
            { _id: usMapSingular._id },
            { 
              $set: { 
                "metadata.totalStates": stateCount,
                "metadata.totalCounties": countyCount,
                "metadata.totalProperties": propertyCount 
              } 
            }
          );
          console.log(`Update result: ${updateResult.modifiedCount === 1 ? "Success" : "No changes needed"}`);
        } else {
          console.log("\nUS Map counts are up to date in usmap collection.");
        }
      } else {
        console.log("- No metadata available, initializing...");
        const initResult = await db.collection('usmap').updateOne(
          { _id: usMapSingular._id },
          { 
            $set: { 
              metadata: {
                totalStates: stateCount,
                totalCounties: countyCount,
                totalProperties: propertyCount
              } 
            } 
          }
        );
        console.log(`Initialization result: ${initResult.modifiedCount === 1 ? "Success" : "Failed"}`);
      }
    } else {
      console.log("No US Map found in usmap collection");
    }
    
    // List all states with their county counts
    console.log('\nState county counts:');
    const states = await db.collection('states').find({}).toArray();
    for (const state of states) {
      const actualCountyCount = await db.collection('counties').countDocuments({ stateId: state._id });
      const metadataCountyCount = state.metadata?.totalCounties || 0;
      
      console.log(`- ${state.name} (${state.abbreviation}): ${actualCountyCount} counties`);
      console.log(`  Metadata count: ${metadataCountyCount}`);
      
      // Update if counts don't match
      if (actualCountyCount !== metadataCountyCount) {
        console.log(`  Updating ${state.name} county count...`);
        await db.collection('states').updateOne(
          { _id: state._id },
          { $set: { "metadata.totalCounties": actualCountyCount } }
        );
        console.log(`  Update successful`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    await client.close();
    console.log('\nMongoDB connection closed');
  }
}

// Run the function
checkCounts(); 