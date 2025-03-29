// Script to create indexes for MongoDB collections
const { MongoClient } = require('mongodb');

// Connection URI
const uri = 'mongodb://localhost:27017/real-estate-platform';

async function createIndexes() {
  console.log('Starting index creation...');
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
    
    // Create indexes for controllers collection
    console.log('\nCreating indexes for controllers collection...');
    const controllerIndexes = await db.collection('controllers').createIndexes([
      { key: { name: 1 }, name: 'name_1', unique: true },
      { key: { controllerType: 1 }, name: 'controllerType_1' },
      { key: { 'implementation.collectorType': 1 }, name: 'implementation_collectorType_1' },
      { key: { 'attachedTo.objectType': 1 }, name: 'attachedTo_objectType_1' }
    ]);
    console.log('Controller indexes created:', controllerIndexes);
    
    // Create indexes for dataSources collection
    console.log('\nCreating indexes for dataSources collection...');
    const dataSourceIndexes = await db.collection('dataSources').createIndexes([
      { key: { name: 1 }, name: 'name_1', unique: true },
      { key: { type: 1 }, name: 'type_1' },
      { key: { collectorType: 1 }, name: 'collectorType_1' },
      { key: { 'region.state': 1 }, name: 'region_state_1' },
      { key: { 'region.county': 1 }, name: 'region_county_1' },
      { key: { status: 1 }, name: 'status_1' }
    ]);
    console.log('DataSource indexes created:', dataSourceIndexes);
    
    // Create indexes for properties collection
    console.log('\nCreating indexes for properties collection...');
    const propertyIndexes = await db.collection('properties').createIndexes([
      { key: { stateId: 1 }, name: 'stateId_1' },
      { key: { countyId: 1 }, name: 'countyId_1' },
      { key: { parentId: 1 }, name: 'parentId_1' },
      { key: { type: 1 }, name: 'type_1' },
      { key: { status: 1 }, name: 'status_1' },
      { key: { 'address.zipCode': 1 }, name: 'address_zipCode_1' },
      { key: { 'metadata.ownerName': 1 }, name: 'metadata_ownerName_1' },
      { key: { geometry: '2dsphere' }, name: 'geometry_2dsphere' },
      { key: { createdAt: 1 }, name: 'createdAt_1' },
      { key: { updatedAt: 1 }, name: 'updatedAt_1' }
    ]);
    console.log('Property indexes created:', propertyIndexes);
    
    // Create indexes for counties collection
    console.log('\nCreating indexes for counties collection...');
    const countyIndexes = await db.collection('counties').createIndexes([
      { key: { stateId: 1, name: 1 }, name: 'stateId_1_name_1', unique: true },
      { key: { parentId: 1 }, name: 'parentId_1' },
      { key: { geometry: '2dsphere' }, name: 'geometry_2dsphere' }
    ]);
    console.log('County indexes created:', countyIndexes);
    
    // Create indexes for states collection
    console.log('\nCreating indexes for states collection...');
    const stateIndexes = await db.collection('states').createIndexes([
      { key: { abbreviation: 1 }, name: 'abbreviation_1', unique: true },
      { key: { name: 1 }, name: 'name_1', unique: true },
      { key: { parentId: 1 }, name: 'parentId_1' },
      { key: { geometry: '2dsphere' }, name: 'geometry_2dsphere' }
    ]);
    console.log('State indexes created:', stateIndexes);
    
    // List all indexes to verify creation
    console.log('\n=== VERIFYING INDEXES ===');
    
    // Controllers indexes
    const controllerAllIndexes = await db.collection('controllers').indexes();
    console.log('\nControllers collection indexes:');
    controllerAllIndexes.forEach(idx => {
      console.log(`- ${idx.name}: ${JSON.stringify(idx.key)}`);
    });
    
    // DataSources indexes
    const dataSourceAllIndexes = await db.collection('dataSources').indexes();
    console.log('\nDataSources collection indexes:');
    dataSourceAllIndexes.forEach(idx => {
      console.log(`- ${idx.name}: ${JSON.stringify(idx.key)}`);
    });
    
    // Properties indexes
    const propertyAllIndexes = await db.collection('properties').indexes();
    console.log('\nProperties collection indexes:');
    propertyAllIndexes.forEach(idx => {
      console.log(`- ${idx.name}: ${JSON.stringify(idx.key)}`);
    });
    
    // Counties indexes
    const countyAllIndexes = await db.collection('counties').indexes();
    console.log('\nCounties collection indexes:');
    countyAllIndexes.forEach(idx => {
      console.log(`- ${idx.name}: ${JSON.stringify(idx.key)}`);
    });
    
    // States indexes
    const stateAllIndexes = await db.collection('states').indexes();
    console.log('\nStates collection indexes:');
    stateAllIndexes.forEach(idx => {
      console.log(`- ${idx.name}: ${JSON.stringify(idx.key)}`);
    });
    
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
createIndexes().then(() => {
  console.log('Script completed');
}).catch(err => {
  console.error('Script failed:', err);
}); 