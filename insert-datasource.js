// Script to insert St. Mary's County Data Source
const { MongoClient } = require('mongodb');

// Connection URI
const uri = 'mongodb://localhost:27017/real-estate-platform';

async function insertDataSource() {
  console.log('Starting St. Mary\'s County Data Source insertion...');
  const client = new MongoClient(uri);
  
  try {
    console.log('Connecting to MongoDB...');
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected to MongoDB');
    
    // Get the database
    const db = client.db('real-estate-platform');
    
    // Check if collection exists
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name).join(', '));
    
    // Create the St. Mary's County Data Source document
    console.log('Creating St. Mary\'s County Data Source document...');
    const stMarysDataSource = {
      name: "St. Mary's County Property Data",
      type: "county-website",
      url: "https://sdat.dat.maryland.gov/RealProperty/",
      region: {
        state: "MD",
        county: "St. Mary's"
      },
      collectorType: "stmarys-county-collector",
      schedule: {
        frequency: "daily",
        dayOfWeek: null,
        dayOfMonth: null
      },
      metadata: {
        lookupMethod: "account_number",
        selectors: {
          ownerName: ".SDAT_Value:contains('Owner Name')",
          propertyAddress: ".SDAT_Value:contains('Premise Address')",
          marketValue: ".SDAT_Label:contains('Total:')",
          taxStatus: ".SDAT_Value:contains('Tax Status')"
        },
        lienUrl: null
      },
      status: "active",
      lastCollected: null,
      errorMessage: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Check if data source already exists
    const existingDataSource = await db.collection('dataSources').findOne({ 
      name: "St. Mary's County Property Data" 
    });
    
    if (existingDataSource) {
      console.log('St. Mary\'s County Data Source already exists with ID:', existingDataSource._id);
      
      // Update the existing data source
      console.log('Updating existing St. Mary\'s County Data Source...');
      const updateResult = await db.collection('dataSources').updateOne(
        { _id: existingDataSource._id },
        { 
          $set: {
            updatedAt: new Date(),
            status: "active",
            metadata: stMarysDataSource.metadata
          } 
        }
      );
      
      console.log('Update result:', updateResult.modifiedCount === 1 ? 'Success' : 'No changes needed');
    } else {
      // Insert the data source
      console.log('Inserting St. Mary\'s County Data Source...');
      const result = await db.collection('dataSources').insertOne(stMarysDataSource);
      
      if (result.acknowledged) {
        console.log(`Successfully inserted St. Mary's County Data Source with ID: ${result.insertedId}`);
        
        // Verify the insertion by retrieving the document
        const insertedDataSource = await db.collection('dataSources').findOne({ _id: result.insertedId });
        console.log('Inserted data source document:');
        console.log(JSON.stringify(insertedDataSource, null, 2));
      } else {
        console.error('Failed to insert St. Mary\'s County Data Source');
      }
    }
    
    // List all data sources in the collection
    console.log('\nRetrieving all data sources...');
    const dataSources = await db.collection('dataSources').find({}).toArray();
    console.log(`Total data sources in collection: ${dataSources.length}`);
    console.log('Data source names:');
    dataSources.forEach(dataSource => {
      console.log(`- ${dataSource.name} (${dataSource.type}, ${dataSource.status || 'Unknown Status'})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the function
console.log('Script started');
insertDataSource().then(() => {
  console.log('Script completed');
}).catch(err => {
  console.error('Script failed:', err);
}); 