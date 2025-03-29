// Script to insert US Map root object
const { MongoClient } = require('mongodb');

// Connection URI
const uri = 'mongodb://localhost:27017/real-estate-platform';

async function insertUSMap() {
  const client = new MongoClient(uri);
  
  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected to MongoDB');
    
    // Get the database
    const db = client.db('real-estate-platform');
    
    // List all collections to confirm
    console.log('Available collections:');
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      console.log(`- ${collection.name}`);
    }
    
    // Create the US Map root object
    const usMapData = {
      name: "US Map",
      type: "us_map",
      metadata: {
        totalStates: 0,
        totalCounties: 0,
        totalProperties: 0,
        statistics: {
          totalTaxLiens: 0,
          totalValue: 0
        }
      },
      controllers: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('Checking if US Map already exists...');
    
    // Check if US Map already exists in usmaps collection
    let existingUSMap = null;
    try {
      existingUSMap = await db.collection('usmaps').findOne({ type: "us_map" });
      console.log('findOne query in "usmaps" executed successfully');
      console.log('Result:', existingUSMap);
    } catch (err) {
      console.error('Error during findOne on "usmaps":', err);
    }
    
    // Also check usmap collection (singular)
    let existingUSMap2 = null;
    try {
      existingUSMap2 = await db.collection('usmap').findOne({ type: "us_map" });
      console.log('findOne query in "usmap" executed successfully');
      console.log('Result:', existingUSMap2);
    } catch (err) {
      console.error('Error during findOne on "usmap":', err);
    }
    
    const exists = existingUSMap || existingUSMap2;
    
    if (exists) {
      console.log('US Map already exists with ID:', exists._id);
      console.log('Existing record:', exists);
    } else {
      console.log('No existing US Map found, inserting new one...');
      
      // Force insert into both collections for safety
      try {
        const result = await db.collection('usmaps').insertOne(usMapData);
        console.log('Inserted US Map into "usmaps" with ID:', result.insertedId);
      } catch (err) {
        console.error('Error during insert into "usmaps":', err);
      }
      
      try {
        const result2 = await db.collection('usmap').insertOne(usMapData);
        console.log('Inserted US Map into "usmap" with ID:', result2.insertedId);
      } catch (err) {
        console.error('Error during insert into "usmap":', err);
      }
    }
    
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  } finally {
    // Close the connection
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the function
insertUSMap(); 