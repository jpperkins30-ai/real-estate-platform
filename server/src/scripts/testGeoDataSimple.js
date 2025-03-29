/**
 * Simplified test script for geographic data initialization
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs').promises;

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Connect to MongoDB
async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform';
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    return false;
  }
}

// Load GeoJSON data for states from the file system
async function loadStateGeoJSON() {
  try {
    const filePath = path.resolve(__dirname, '../../../data/geojson/states.json');
    console.log(`Attempting to load states from: ${filePath}`);
    
    try {
      await fs.access(filePath);
    } catch (error) {
      console.warn(`States GeoJSON file not found at ${filePath}. Using default minimal data.`);
      // Return minimal default data for a few states
      return [
        {
          name: "California",
          abbreviation: "CA",
          geometry: { type: "MultiPolygon", coordinates: [] }
        },
        {
          name: "Texas",
          abbreviation: "TX",
          geometry: { type: "MultiPolygon", coordinates: [] }
        },
        {
          name: "New York",
          abbreviation: "NY",
          geometry: { type: "MultiPolygon", coordinates: [] }
        }
      ];
    }
    
    const data = await fs.readFile(filePath, 'utf8');
    const geojson = JSON.parse(data);
    
    console.log(`Loaded GeoJSON data for ${geojson.features.length} states`);
    
    return geojson.features.map((feature) => ({
      name: feature.properties.name || feature.properties.NAME,
      abbreviation: feature.properties.abbreviation || feature.properties.STUSPS,
      geometry: feature.geometry
    }));
  } catch (error) {
    console.error('Error loading state GeoJSON:', error);
    // Return minimal default data for a few states
    console.warn('Using default minimal state data due to error');
    return [
      {
        name: "California",
        abbreviation: "CA",
        geometry: { type: "MultiPolygon", coordinates: [] }
      },
      {
        name: "Texas",
        abbreviation: "TX",
        geometry: { type: "MultiPolygon", coordinates: [] }
      },
      {
        name: "New York",
        abbreviation: "NY",
        geometry: { type: "MultiPolygon", coordinates: [] }
      }
    ];
  }
}

// Simple test function
async function testGeoData() {
  try {
    console.log('Starting simplified geographic data test...');
    
    // Connect to database
    const dbConnected = await connectToDatabase();
    if (!dbConnected) {
      throw new Error('Failed to connect to database');
    }
    
    // Get models
    // First, try to use existing models if they are already registered
    let USMap, State, County;
    
    try {
      USMap = mongoose.model('USMap');
      State = mongoose.model('State');
      County = mongoose.model('County');
      console.log('Using existing mongoose models');
    } catch (error) {
      // If models don't exist, create them
      console.log('Creating mongoose models');
      
      // Define USMap schema if it doesn't exist
      const USMapSchema = new mongoose.Schema({
        name: { type: String, default: "US Map" },
        type: { type: String, default: "us_map" },
        metadata: {
          totalStates: { type: Number, default: 0 },
          totalCounties: { type: Number, default: 0 },
          totalProperties: { type: Number, default: 0 }
        }
      }, { collection: 'usmap' });
      
      // Define State schema if it doesn't exist
      const StateSchema = new mongoose.Schema({
        name: String,
        abbreviation: String,
        type: { type: String, default: "state" },
        parentId: mongoose.Schema.Types.ObjectId,
        geometry: Object,
        metadata: Object
      });
      
      // Define County schema if it doesn't exist
      const CountySchema = new mongoose.Schema({
        name: String,
        type: { type: String, default: "county" },
        stateId: mongoose.Schema.Types.ObjectId,
        parentId: mongoose.Schema.Types.ObjectId,
        geometry: Object,
        metadata: Object
      });
      
      USMap = mongoose.model('USMap', USMapSchema);
      State = mongoose.model('State', StateSchema);
      County = mongoose.model('County', CountySchema);
    }
    
    // Create or update US Map if needed
    let usMap = await USMap.findOne({ type: 'us_map' });
    if (!usMap) {
      console.log('Creating new US Map');
      usMap = new USMap({
        name: 'US Map',
        type: 'us_map',
        metadata: {
          totalStates: 0,
          totalCounties: 0,
          totalProperties: 0
        }
      });
      await usMap.save();
    }
    
    // Load and process states
    const stateData = await loadStateGeoJSON();
    console.log(`Processing ${stateData.length} states`);
    
    // Create or update states
    for (const state of stateData) {
      let existingState = await State.findOne({ abbreviation: state.abbreviation });
      
      if (existingState) {
        console.log(`State ${state.name} already exists`);
        // Update geometry if needed
        if (!existingState.geometry) {
          existingState.geometry = state.geometry;
          await existingState.save();
          console.log(`Updated geometry for state: ${state.name}`);
        }
      } else {
        // Create new state
        console.log(`Creating new state: ${state.name}`);
        await State.create({
          name: state.name,
          abbreviation: state.abbreviation,
          type: 'state',
          parentId: usMap._id,
          geometry: state.geometry,
          metadata: {
            totalCounties: 0,
            totalProperties: 0
          }
        });
      }
    }
    
    // Update counts
    const stateCount = await State.countDocuments();
    const countyCount = await County.countDocuments();
    
    // Update US Map with counts
    usMap.metadata.totalStates = stateCount;
    usMap.metadata.totalCounties = countyCount;
    await usMap.save();
    
    console.log('Geographic data test results:');
    console.log(`- US Map: ${usMap.name}`);
    console.log(`- Total states: ${stateCount}`);
    console.log(`- Total counties: ${countyCount}`);
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Error in geographic data test:', error);
  } finally {
    // Close database connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testGeoData().then(() => {
  console.log('Geographic data test completed');
  process.exit(0);
}).catch(error => {
  console.error('Geographic data test failed:', error);
  process.exit(1);
}); 