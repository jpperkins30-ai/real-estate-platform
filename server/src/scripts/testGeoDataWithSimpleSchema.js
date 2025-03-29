/**
 * Test script for geographic data initialization using simplified schemas
 */

const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');

// Set up MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform';

// Initialize logger
const logger = {
  info: (msg) => console.log(`INFO: ${msg}`),
  error: (msg, err) => console.error(`ERROR: ${msg}`, err),
  warn: (msg) => console.warn(`WARN: ${msg}`)
};

// Create simplified schemas without strict validation
// Simple USMap schema
const SimpleUSMapSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  metadata: { type: Object }
}, {
  collection: 'simpleusmaps',
  strict: false
});

// Simple State schema
const SimpleStateSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  abbreviation: { type: String, required: true },
  type: { type: String, required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  geometry: { type: Object }
}, {
  collection: 'simplestates',
  strict: false
});

// Simple County schema
const SimpleCountySchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  stateId: { type: mongoose.Schema.Types.ObjectId, required: true },
  geometry: { type: Object }
}, {
  collection: 'simplecounties',
  strict: false
});

async function testGeoDataWithSimpleSchema() {
  try {
    // Connect to MongoDB
    logger.info('Connecting to MongoDB');
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB');
    
    // Create the models
    const SimpleUSMap = mongoose.model('SimpleUSMap', SimpleUSMapSchema);
    const SimpleState = mongoose.model('SimpleState', SimpleStateSchema);
    const SimpleCounty = mongoose.model('SimpleCounty', SimpleCountySchema);
    
    // Step 1: Create or get US Map object
    let usMap = await SimpleUSMap.findOne({ type: 'us_map' });
    if (!usMap) {
      logger.info('Creating US Map root object');
      usMap = await SimpleUSMap.create({
        name: 'US Map',
        type: 'us_map',
        metadata: {
          totalStates: 0,
          totalCounties: 0
        }
      });
    }
    logger.info(`US Map object: ${usMap.name} (${usMap._id})`);
    
    // Step 2: Load GeoJSON for states
    logger.info('Loading state GeoJSON');
    const statesFilePath = path.join(__dirname, '../../../data/geojson/states.json');
    const statesData = await fs.readFile(statesFilePath, 'utf8');
    const statesGeoJSON = JSON.parse(statesData);
    
    logger.info(`Loaded ${statesGeoJSON.features.length} states from GeoJSON`);
    
    // Step 3: Process states
    for (const stateFeature of statesGeoJSON.features) {
      const name = stateFeature.properties.name;
      const abbreviation = stateFeature.properties.abbreviation;
      const id = abbreviation.toLowerCase();
      
      logger.info(`Processing state: ${name} (${abbreviation})`);
      
      // Check if state exists
      let state = await SimpleState.findOne({ abbreviation });
      
      if (state) {
        logger.info(`State ${name} already exists, updating`);
        state.name = name;
        state.geometry = stateFeature.geometry;
        await state.save();
      } else {
        logger.info(`Creating new state: ${name}`);
        state = await SimpleState.create({
          id,
          name,
          abbreviation,
          type: 'state',
          parentId: usMap._id,
          geometry: stateFeature.geometry
        });
      }
      
      // Step 4: Load and process counties for this state
      const countiesFilePath = path.join(__dirname, `../../../data/geojson/counties/${abbreviation.toLowerCase()}.json`);
      
      try {
        const countiesData = await fs.readFile(countiesFilePath, 'utf8');
        const countiesGeoJSON = JSON.parse(countiesData);
        
        logger.info(`Loaded ${countiesGeoJSON.features.length} counties for ${abbreviation}`);
        
        for (const countyFeature of countiesGeoJSON.features) {
          const countyName = countyFeature.properties.NAME;
          const countyId = `${abbreviation.toLowerCase()}-${countyName.toLowerCase().replace(/\s+/g, '-')}`;
          
          // Check if county exists
          let county = await SimpleCounty.findOne({ id: countyId });
          
          if (county) {
            logger.info(`County ${countyName} already exists, updating`);
            county.geometry = countyFeature.geometry;
            await county.save();
          } else {
            logger.info(`Creating new county: ${countyName}, ${abbreviation}`);
            county = await SimpleCounty.create({
              id: countyId,
              name: countyName,
              type: 'county',
              parentId: state._id,
              stateId: state._id,
              geometry: countyFeature.geometry
            });
          }
        }
      } catch (error) {
        logger.warn(`No counties found for ${abbreviation}: ${error.message}`);
      }
    }
    
    // Step 5: Report success
    const stateCount = await SimpleState.countDocuments();
    const countyCount = await SimpleCounty.countDocuments();
    
    logger.info(`Test complete. Created/updated ${stateCount} states and ${countyCount} counties`);
    
  } catch (error) {
    logger.error('Error in test process:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
}

// Run the script
testGeoDataWithSimpleSchema().catch(err => {
  logger.error('Unhandled error in test process:', err);
  process.exit(1);
}); 