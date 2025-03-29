// Simple script to create a USMap entry in MongoDB
const { MongoClient } = require('mongodb');

// Connection URL
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'real-estate';

async function main() {
  // Use connect method to connect to the server
  await client.connect();
  console.log('Connected successfully to MongoDB server');
  
  const db = client.db(dbName);
  const collection = db.collection('usmaps');
  
  // Check if USMap already exists
  const existingUSMap = await collection.findOne({});
  
  if (existingUSMap) {
    console.log('USMap already exists:', existingUSMap);
  } else {
    // Create a new USMap entry
    const usMapData = {
      name: 'US Map',
      type: 'us_map',
      metadata: {
        totalStates: 0,
        totalCounties: 0,
        totalProperties: 0,
        statistics: {
          totalTaxLiens: 0,
          totalValue: 0
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(usMapData);
    console.log('Created USMap with ID:', result.insertedId);
  }
  
  return 'done';
}

main()
  .then(console.log)
  .catch(console.error)
  .finally(() => client.close()); 