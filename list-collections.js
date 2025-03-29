// Script to list controllers and dataSources collections
const { MongoClient } = require('mongodb');

// Connection URI
const uri = 'mongodb://localhost:27017/real-estate-platform';

async function listCollections() {
  console.log('Starting collections listing...');
  const client = new MongoClient(uri);
  
  try {
    console.log('Connecting to MongoDB...');
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected to MongoDB');
    
    // Get the database
    const db = client.db('real-estate-platform');
    
    // Check available collections
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name).join(', '));
    
    // List controllers
    console.log('\n=== CONTROLLERS ===');
    try {
      const controllers = await db.collection('controllers').find({}).toArray();
      console.log(`Total controllers: ${controllers.length}`);
      
      if (controllers.length > 0) {
        controllers.forEach((controller, index) => {
          console.log(`\nController #${index + 1}: ${controller.name}`);
          console.log(`- ID: ${controller._id}`);
          console.log(`- Type: ${controller.type}`);
          console.log(`- Controller Type: ${controller.controllerType}`);
          console.log(`- Description: ${controller.description}`);
          console.log(`- Created: ${controller.createdAt}`);
          
          if (controller.implementation) {
            console.log(`- Implementation: ${controller.implementation.collectorType}`);
            console.log(`- Supported Source Types: ${controller.implementation.supportedSourceTypes.join(', ')}`);
          }
        });
      } else {
        console.log('No controllers found');
      }
    } catch (err) {
      console.error('Error listing controllers:', err.message);
    }
    
    // List data sources
    console.log('\n=== DATA SOURCES ===');
    try {
      const dataSources = await db.collection('dataSources').find({}).toArray();
      console.log(`Total data sources: ${dataSources.length}`);
      
      if (dataSources.length > 0) {
        dataSources.forEach((dataSource, index) => {
          console.log(`\nData Source #${index + 1}: ${dataSource.name}`);
          console.log(`- ID: ${dataSource._id}`);
          console.log(`- Type: ${dataSource.type}`);
          console.log(`- URL: ${dataSource.url}`);
          
          if (dataSource.region) {
            console.log(`- Region: ${dataSource.region.state}, ${dataSource.region.county}`);
          }
          
          console.log(`- Collector Type: ${dataSource.collectorType}`);
          console.log(`- Status: ${dataSource.status}`);
          console.log(`- Created: ${dataSource.createdAt}`);
        });
      } else {
        console.log('No data sources found');
      }
    } catch (err) {
      console.error('Error listing data sources:', err.message);
    }
    
    // List alternative datasources collection (if exists)
    console.log('\n=== DATASOURCES (lowercase) ===');
    try {
      if (collections.some(c => c.name === 'datasources')) {
        const altDataSources = await db.collection('datasources').find({}).toArray();
        console.log(`Total in lowercase datasources: ${altDataSources.length}`);
        
        if (altDataSources.length > 0) {
          altDataSources.forEach((dataSource, index) => {
            console.log(`\nData Source #${index + 1}: ${dataSource.name || 'Unnamed'}`);
            console.log(`- ID: ${dataSource._id}`);
            console.log(`- Type: ${dataSource.type || 'Unknown'}`);
          });
        } else {
          console.log('No records in lowercase datasources collection');
        }
      } else {
        console.log('Lowercase datasources collection does not exist');
      }
    } catch (err) {
      console.error('Error listing lowercase datasources:', err.message);
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
console.log('Script started');
listCollections().then(() => {
  console.log('Script completed');
}).catch(err => {
  console.error('Script failed:', err);
}); 