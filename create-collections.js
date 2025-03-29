// Script to create MongoDB collections
const { MongoClient } = require('mongodb');

// Connection URI
const uri = 'mongodb://localhost:27017/real-estate-platform';

async function createCollections() {
  const client = new MongoClient(uri);
  
  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected to MongoDB');
    
    // Get the database
    const db = client.db('real-estate-platform');
    
    // Create collections
    const collections = [
      'usmaps',
      'states',
      'counties',
      'properties',
      'controllers',
      'dataSources',
      'collections'
    ];
    
    for (const collectionName of collections) {
      try {
        await db.createCollection(collectionName);
        console.log(`Collection '${collectionName}' created successfully`);
      } catch (error) {
        // If collection already exists, MongoDB will throw an error
        if (error.code === 48) {
          console.log(`Collection '${collectionName}' already exists`);
        } else {
          console.error(`Error creating collection '${collectionName}':`, error.message);
        }
      }
    }
    
    // List all collections to confirm
    const collectionsList = await db.listCollections().toArray();
    console.log('\nExisting collections:');
    collectionsList.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  } finally {
    // Close the connection
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the function
createCollections(); 