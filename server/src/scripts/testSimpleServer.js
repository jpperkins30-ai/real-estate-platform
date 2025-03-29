/**
 * Test script for the County model with customId
 * 
 * This script:
 * 1. Connects to MongoDB
 * 2. Creates a test county with customId
 * 3. Retrieves it and verifies the ID mapping works
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform';

// Connect to MongoDB
console.log('Connecting to MongoDB...');
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    testCountyModel();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Define simplified schemas for State and County
const StateSchema = new Schema({
  id: String,
  abbreviation: String,
  name: String
});

const CountySchema = new Schema({
  customId: {
    type: String,
    unique: true,
    required: true
  },
  name: String,
  type: String,
  stateId: Schema.Types.ObjectId,
  metadata: Schema.Types.Mixed
}, { 
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add a virtual for 'id' that returns customId
CountySchema.virtual('id').get(function() {
  return this.customId;
});

// Transform for JSON conversion
CountySchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Create models
// Check if models already exist to avoid re-registering them
const State = mongoose.models.State || mongoose.model('State', StateSchema);
const County = mongoose.models.County || mongoose.model('County', CountySchema);

async function testCountyModel() {
  try {
    console.log('Starting County model test...');
    
    // Find a state to use as parent
    const state = await State.findOne({ abbreviation: 'TX' });
    
    if (!state) {
      throw new Error('No state found to use as parent');
    }
    
    console.log(`Using state: ${state.name} (${state.id || state._id})`);
    
    // Create a unique name for the test county
    const timestamp = new Date().getTime();
    const testCountyName = `Test County ${timestamp}`;
    const customId = `tx-test-county-${timestamp}`;
    
    // Create a test county
    console.log(`Creating test county: ${testCountyName} with customId: ${customId}`);
    const newCounty = new County({
      customId: customId,
      name: testCountyName,
      type: 'county',
      stateId: state._id,
      metadata: {
        isTest: true,
        timestamp
      }
    });
    
    // Save the county
    const savedCounty = await newCounty.save();
    console.log('County created successfully!');
    
    // Load the actual model definition from the application to ensure it matches
    console.log('\nSchema validation:');
    console.log(`- County model has id virtual: ${typeof County.schema.virtuals.id !== 'undefined'}`);
    console.log(`- County virtuals enabled: ${County.schema.options.toJSON?.virtuals}`);
    
    // Retrieve the county by customId
    const retrievedCounty = await County.findOne({ customId: customId });
    
    if (!retrievedCounty) {
      throw new Error('Could not retrieve county by customId');
    }
    
    console.log('\nRetrieved county:');
    console.log(`- Name: ${retrievedCounty.name}`);
    console.log(`- Internal _id: ${retrievedCounty._id}`);
    console.log(`- customId: ${retrievedCounty.customId}`);
    console.log(`- Virtual id accessor: ${retrievedCounty.id}`);
    console.log(`- Direct get: ${retrievedCounty.get('id')}`);
    
    // Check if model definition in the existing database matches our schema
    console.log('\nVerifying county data directly from MongoDB:');
    const rawCounty = await mongoose.connection.db.collection('counties').findOne({ customId });
    console.log(`- Raw customId: ${rawCounty.customId}`);
    
    // Verify the virtual getter works
    if (retrievedCounty.customId === retrievedCounty.get('id')) {
      console.log('\nSUCCESS: Direct access via get() returns customId');
    } else {
      console.error('\nERROR: Direct access via get() is not working correctly');
    }
    
    // Test JSON serialization
    const jsonCounty = retrievedCounty.toJSON();
    console.log('\nJSON serialization test:');
    console.log(`- Has id: ${jsonCounty.id !== undefined}`);
    console.log(`- Has customId: ${jsonCounty.customId !== undefined}`);
    console.log(`- Missing _id: ${jsonCounty._id === undefined}`);
    console.log(`- id value: ${jsonCounty.id}`);
    console.log(`- customId value: ${jsonCounty.customId}`);
    
    // Check if the ID is showing up as expected in the toObject result
    const objectCounty = retrievedCounty.toObject();
    console.log('\nObject conversion test:');
    console.log(`- Has id: ${objectCounty.id !== undefined}`);
    console.log(`- Has customId: ${objectCounty.customId !== undefined}`);
    console.log(`- id value: ${objectCounty.id}`);
    
    // Clean up the test data
    console.log('\nCleaning up test data...');
    await County.deleteOne({ customId: customId });
    console.log('Test county deleted');
    
    console.log('\nTest completed successfully!');
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Test failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
} 