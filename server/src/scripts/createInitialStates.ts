import mongoose from 'mongoose';
import { State } from '../models/state.model';
import { USMap } from '../models/usmap.model';
import { loadStateGeoJSON } from '../utils/geoDataUtils';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Configuration for initial states
const initialStates = [
  {
    name: 'Maryland',
    abbreviation: 'MD',
    metadata: {
      regionalInfo: {
        region: 'East',
        subregion: 'South Atlantic'
      }
    }
  },
  {
    name: 'Texas',
    abbreviation: 'TX',
    metadata: {
      regionalInfo: {
        region: 'South',
        subregion: 'West South Central'
      }
    }
  },
  {
    name: 'Pennsylvania',
    abbreviation: 'PA',
    metadata: {
      regionalInfo: {
        region: 'Northeast',
        subregion: 'Mid-Atlantic'
      }
    }
  }
];

async function createInitialStates() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');
    
    // Get US Map object
    let usMap = await USMap.findOne();
    if (!usMap) {
      usMap = await USMap.create({
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
        }
      });
      console.log('Created US Map');
    }
    
    // Load state GeoJSON data
    const stateGeoJSON = await loadStateGeoJSON();
    console.log(`Loaded GeoJSON data for ${stateGeoJSON.length} states`);
    
    // Create states
    for (const stateConfig of initialStates) {
      // Check if state already exists
      const existingState = await State.findOne({ abbreviation: stateConfig.abbreviation });
      
      if (existingState) {
        console.log(`State ${stateConfig.name} already exists`);
        continue;
      }
      
      // Find GeoJSON for this state
      const stateGeo = stateGeoJSON.find(s => s.abbreviation === stateConfig.abbreviation);
      
      if (!stateGeo) {
        console.error(`GeoJSON not found for state ${stateConfig.abbreviation}`);
        continue;
      }
      
      // Create state
      const state = await State.create({
        name: stateConfig.name,
        abbreviation: stateConfig.abbreviation,
        type: 'state',
        parentId: usMap._id,
        geometry: stateGeo.geometry,
        metadata: {
          ...stateConfig.metadata,
          totalCounties: 0,
          totalProperties: 0,
          statistics: {
            totalTaxLiens: 0,
            totalValue: 0
          }
        }
      });
      
      console.log(`Created state ${state.name}`);
    }
    
    // Update US Map statistics
    const stateCount = await State.countDocuments();
    await USMap.findByIdAndUpdate(usMap._id, {
      'metadata.totalStates': stateCount
    });
    
    console.log('Initial states created successfully');
  } catch (error) {
    console.error('Error creating initial states:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the script if this file is executed directly
if (require.main === module) {
  createInitialStates()
    .then(() => {
      console.log('Script completed');
      process.exit(0);
    })
    .catch(err => {
      console.error('Script failed:', err);
      process.exit(1);
    });
}

export { createInitialStates }; 