// Script to insert Tax Sale Controller
const { MongoClient } = require('mongodb');

// Connection URI
const uri = 'mongodb://localhost:27017/real-estate-platform';

async function insertController() {
  const client = new MongoClient(uri);
  
  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected to MongoDB');
    
    // Get the database
    const db = client.db('real-estate-platform');
    
    // Create the Tax Sale Controller document
    const taxSaleController = {
      name: "Tax Sale Controller",
      type: "controller",
      controllerType: "Tax Sale",
      description: "Collects tax sale data from county websites",
      configTemplate: {
        requiredFields: ["frequency"],
        optionalFields: {
          dayOfWeek: true,
          dayOfMonth: true
        }
      },
      attachedTo: [],
      implementation: {
        collectorType: "general-tax-sale-collector",
        supportedSourceTypes: ["county-website", "api", "pdf"],
        additionalConfig: {}
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert the controller
    const result = await db.collection('controllers').insertOne(taxSaleController);
    
    if (result.acknowledged) {
      console.log(`Successfully inserted Tax Sale Controller with ID: ${result.insertedId}`);
      
      // Verify the insertion by retrieving the document
      const insertedController = await db.collection('controllers').findOne({ _id: result.insertedId });
      console.log('Inserted controller document:');
      console.log(JSON.stringify(insertedController, null, 2));
    } else {
      console.error('Failed to insert Tax Sale Controller');
    }
    
    // List all controllers in the collection
    const controllers = await db.collection('controllers').find({}).toArray();
    console.log(`\nTotal controllers in collection: ${controllers.length}`);
    console.log('Controller names:');
    controllers.forEach(controller => {
      console.log(`- ${controller.name} (${controller.controllerType})`);
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
insertController(); 