/**
 * Test script to work with a simplified county schema without strict validation
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

// Create a simplified schema without strict coordinates validation
const SimpleCountySchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  state: { type: String, required: true },
  geometry: {
    type: { type: String, required: true },
    coordinates: { type: mongoose.Schema.Types.Mixed, required: true }
  }
}, {
  collection: 'simplecounties',
  strict: false
});

async function testSimpleCounty() {
  try {
    // Connect to MongoDB
    logger.info('Connecting to MongoDB');
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB');
    
    // Create the model
    const SimpleCounty = mongoose.model('SimpleCounty', SimpleCountySchema);
    
    // Read and process counties from JSON files
    const statesToProcess = ['md', 'tx', 'ca', 'ny', 'fl'];
    let totalProcessed = 0;
    
    for (const state of statesToProcess) {
      try {
        const filePath = path.join(__dirname, `../../../data/geojson/counties/${state}.json`);
        
        try {
          await fs.access(filePath);
          logger.info(`Processing county file for ${state.toUpperCase()}`);
          
          const data = await fs.readFile(filePath, 'utf8');
          const geojson = JSON.parse(data);
          
          for (const feature of geojson.features) {
            const name = feature.properties.NAME;
            const stateAbbr = feature.properties.STATE;
            
            // Create a simple ID
            const id = `${stateAbbr.toLowerCase()}-${name.toLowerCase().replace(/\s+/g, '-')}`;
            
            try {
              // Check if county already exists
              const existingCounty = await SimpleCounty.findOne({ id });
              
              if (existingCounty) {
                logger.info(`County ${name}, ${stateAbbr} already exists, updating`);
                existingCounty.geometry = feature.geometry;
                await existingCounty.save();
              } else {
                logger.info(`Creating new county: ${name}, ${stateAbbr}`);
                await SimpleCounty.create({
                  id,
                  name,
                  state: stateAbbr,
                  geometry: feature.geometry
                });
              }
              
              totalProcessed++;
            } catch (error) {
              logger.error(`Error processing county ${name} in ${stateAbbr}:`, error);
            }
          }
        } catch (error) {
          logger.warn(`County file not found for ${state.toUpperCase()}`);
        }
      } catch (error) {
        logger.error(`Error processing state ${state}:`, error);
      }
    }
    
    logger.info(`Processed ${totalProcessed} counties successfully`);
    
    // Query and display some counties to verify
    const counties = await SimpleCounty.find().limit(5);
    logger.info(`Sample counties (${counties.length}):`);
    
    counties.forEach(county => {
      logger.info(`- ${county.name}, ${county.state} (${county.id})`);
      
      // Deep stringify the geometry to check its format
      const geometryStr = JSON.stringify(county.geometry, null, 2);
      logger.info(`  Geometry type: ${county.geometry.type}`);
      logger.info(`  Coordinates sample: ${geometryStr.substring(0, 100)}...`);
    });
    
  } catch (error) {
    logger.error('Error in test process:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
}

// Run the script
testSimpleCounty().catch(err => {
  logger.error('Unhandled error in test process:', err);
  process.exit(1);
}); 