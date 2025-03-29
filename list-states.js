// Script to list states and update US Map count
const { MongoClient } = require('mongodb');

// Connection URI
const uri = 'mongodb://localhost:27017/real-estate-platform';

async function listStates() {
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
    
    // List all states
    console.log('\nAll states in database:');
    const allStates = await db.collection('states').find({}).toArray();
    
    if (allStates.length === 0) {
      console.log('No states found in the database.');
    } else {
      allStates.forEach((state, index) => {
        console.log(`\nState #${index + 1}: ${state.name} (${state.abbreviation})`);
        console.log(`- ID: ${state._id}`);
        console.log(`- ParentId: ${state.parentId}`);
        console.log(`- Type: ${state.type}`);
        console.log(`- Geometry type: ${state.geometry ? state.geometry.type : 'None'}`);
        console.log(`- Total counties: ${state.metadata ? state.metadata.totalCounties : 'undefined'}`);
        console.log(`- Total properties: ${state.metadata ? state.metadata.totalProperties : 'undefined'}`);
        console.log(`- Created: ${state.createdAt}`);
      });
    }
    
    // Get the USMap from both collections
    const usMap1 = await db.collection('usmaps').findOne({ type: "us_map" });
    const usMap2 = await db.collection('usmap').findOne({ type: "us_map" });
    
    console.log('\nUS Map in usmaps collection:');
    if (usMap1) {
      console.log(`- ID: ${usMap1._id}`);
      console.log(`- State count: ${usMap1.metadata.totalStates}`);
      console.log(`- Total counties: ${usMap1.metadata.totalCounties}`);
      console.log(`- Total properties: ${usMap1.metadata.totalProperties}`);
      console.log(`- Created: ${usMap1.createdAt}`);
    } else {
      console.log('Not found');
    }
    
    console.log('\nUS Map in usmap collection:');
    if (usMap2) {
      console.log(`- ID: ${usMap2._id}`);
      console.log(`- State count: ${usMap2.metadata.totalStates}`);
      console.log(`- Total counties: ${usMap2.metadata.totalCounties}`);
      console.log(`- Total properties: ${usMap2.metadata.totalProperties}`);
      console.log(`- Created: ${usMap2.createdAt}`);
    } else {
      console.log('Not found');
    }
    
    // Update both US Map documents with correct state count
    if (usMap1 && usMap1.metadata.totalStates !== stateCount) {
      const updateResult = await db.collection('usmaps').updateOne(
        { _id: usMap1._id },
        { $set: { "metadata.totalStates": stateCount } }
      );
      console.log(`\nUpdated US Map in usmaps: ${updateResult.modifiedCount === 1 ? 'Success' : 'No change needed'}`);
    } else if (usMap1) {
      console.log('\nUS Map in usmaps already has correct state count.');
    }
    
    if (usMap2 && usMap2.metadata.totalStates !== stateCount) {
      const updateResult2 = await db.collection('usmap').updateOne(
        { _id: usMap2._id },
        { $set: { "metadata.totalStates": stateCount } }
      );
      console.log(`Updated US Map in usmap: ${updateResult2.modifiedCount === 1 ? 'Success' : 'No change needed'}`);
    } else if (usMap2) {
      console.log('US Map in usmap already has correct state count.');
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
listStates(); 