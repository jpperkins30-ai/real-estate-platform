import mongoose from 'mongoose';
import { State } from '../models/state.model';
import { County } from '../models/county.model';
import { loadCountyGeoJSON } from '../utils/geoDataUtils';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Configuration for initial counties
const initialCounties = [
  {
    name: "St. Mary's",
    state: 'MD',
    metadata: {
      searchConfig: {
        lookupMethod: 'account_number',
        searchUrl: 'https://sdat.dat.maryland.gov/RealProperty/',
        selectors: {
          ownerName: '.SDAT_Value:contains("Owner Name")',
          propertyAddress: '.SDAT_Value:contains("Premise Address")',
          marketValue: '.SDAT_Label:contains("Total:")',
          taxStatus: '.SDAT_Value:contains("Tax Status")'
        },
        lienUrl: null
      }
    }
  },
  {
    name: 'Harris',
    state: 'TX',
    metadata: {
      searchConfig: {
        lookupMethod: 'account_number',
        searchUrl: 'https://hcad.org/property-search',
        selectors: {
          ownerName: '#ownerName',
          propertyAddress: '#situsAddress',
          marketValue: '#marketValue',
          taxStatus: '#taxStatus'
        },
        lienUrl: 'https://www.hctax.net/Property/AccountSearch'
      }
    }
  }
];

async function createInitialCounties() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');
    
    // Create counties
    for (const countyConfig of initialCounties) {
      // Get state
      const state = await State.findOne({ abbreviation: countyConfig.state });
      
      if (!state) {
        console.error(`State ${countyConfig.state} not found`);
        continue;
      }
      
      // Check if county already exists
      const existingCounty = await County.findOne({ 
        name: countyConfig.name,
        stateId: state._id
      });
      
      if (existingCounty) {
        console.log(`County ${countyConfig.name}, ${countyConfig.state} already exists`);
        continue;
      }
      
      // Load county GeoJSON
      const countyGeoJSON = await loadCountyGeoJSON(countyConfig.state);
      console.log(`Loaded GeoJSON data for ${countyGeoJSON.length} counties in ${countyConfig.state}`);
      
      // Find GeoJSON for this county
      const countyGeo = countyGeoJSON.find(c => c.name === countyConfig.name);
      
      if (!countyGeo) {
        console.error(`GeoJSON not found for county ${countyConfig.name}, ${countyConfig.state}`);
        continue;
      }
      
      // Create county
      const county = await County.create({
        name: countyConfig.name,
        type: 'county',
        parentId: state._id,
        stateId: state._id,
        geometry: countyGeo.geometry,
        metadata: {
          ...countyConfig.metadata,
          totalProperties: 0,
          statistics: {
            totalTaxLiens: 0,
            totalValue: 0
          }
        }
      });
      
      console.log(`Created county ${county.name}, ${countyConfig.state}`);
      
      // Update state statistics
      await State.findByIdAndUpdate(state._id, {
        $inc: { 'metadata.totalCounties': 1 }
      });
    }
    
    console.log('Initial counties created successfully');
  } catch (error) {
    console.error('Error creating initial counties:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the script if this file is executed directly
if (require.main === module) {
  createInitialCounties()
    .then(() => {
      console.log('Script completed');
      process.exit(0);
    })
    .catch(err => {
      console.error('Script failed:', err);
      process.exit(1);
    });
}

export { createInitialCounties }; 