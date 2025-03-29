/**
 * Test script to verify the updated models can handle GeoJSON coordinates properly
 */

const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const Schema = mongoose.Schema;

// Set up MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform';

// Configure logger
const logger = {
  info: (msg) => console.log(`INFO: ${msg}`),
  error: (msg, err) => console.error(`ERROR: ${msg}`, err),
  warn: (msg) => console.warn(`WARN: ${msg}`)
};

// Create a test County model with the updated schema
const TestCountySchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  state: { type: String, required: true },
  geometry: {
    type: { type: String, required: true, enum: ['Polygon', 'MultiPolygon'] },
    coordinates: { type: Schema.Types.Mixed, required: true } // Using Schema.Types.Mixed
  }
}, {
  collection: 'testcounties'
});

async function testModelUpdate() {
  try {
    // Connect to MongoDB
    logger.info('Connecting to MongoDB');
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB');
    
    // Create the test model
    const TestCounty = mongoose.model('TestCounty', TestCountySchema);
    
    // Load a sample GeoJSON file
    logger.info('Loading sample GeoJSON file');
    const filePath = path.join(__dirname, '../../../data/geojson/counties/ca.json');
    const data = await fs.readFile(filePath, 'utf8');
    const geojson = JSON.parse(data);
    
    logger.info(`Loaded GeoJSON with ${geojson.features.length} features`);
    
    // Process each feature in the GeoJSON
    for (const feature of geojson.features) {
      const countyName = feature.properties.NAME;
      const stateAbbr = feature.properties.STATE;
      const countyId = `test-${stateAbbr.toLowerCase()}-${countyName.toLowerCase().replace(/\s+/g, '-')}`;
      
      logger.info(`Processing county: ${countyName}, ${stateAbbr}`);
      
      try {
        // Check if test county already exists
        const existingCounty = await TestCounty.findOne({ id: countyId });
        
        if (existingCounty) {
          logger.info(`Test county ${countyName} already exists, updating`);
          existingCounty.geometry = feature.geometry;
          await existingCounty.save();
          logger.info(`Successfully updated test county: ${countyName}`);
        } else {
          logger.info(`Creating new test county: ${countyName}`);
          
          // Log the geometry to check its format
          logger.info(`Geometry type: ${feature.geometry.type}`);
          logger.info(`Coordinates: ${JSON.stringify(feature.geometry.coordinates).substring(0, 100)}...`);
          
          // Create the test county
          const testCounty = await TestCounty.create({
            id: countyId,
            name: countyName,
            state: stateAbbr,
            geometry: feature.geometry
          });
          
          logger.info(`Successfully created test county: ${countyName} with ID: ${testCounty.id}`);
        }
      } catch (error) {
        logger.error(`Error processing county ${countyName}:`, error);
      }
    }
    
    // Verify the test counties were created successfully
    const count = await TestCounty.countDocuments();
    logger.info(`Created/updated ${count} test counties successfully`);
    
    // Retrieve one of the test counties to verify the geometry
    const sample = await TestCounty.findOne();
    if (sample) {
      logger.info(`Sample test county: ${sample.name}, ${sample.state}`);
      logger.info(`Geometry type: ${sample.geometry.type}`);
      logger.info(`Coordinates sample: ${JSON.stringify(sample.geometry.coordinates).substring(0, 100)}...`);
    }
    
  } catch (error) {
    logger.error('Error in test process:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
}

// Run the script
testModelUpdate().catch(err => {
  logger.error('Unhandled error in test process:', err);
  process.exit(1);
}); 