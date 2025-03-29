import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import { USMap } from '../models/usmap.model';
import { State } from '../models/state.model';
import { County } from '../models/county.model';
import logger from '../utils/logger';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Connect to MongoDB
async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate';
  
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info(`Connected to MongoDB at ${MONGODB_URI}`);
    return true;
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    return false;
  }
}

// Load GeoJSON data
async function loadGeoJSONFiles() {
  try {
    // Load states GeoJSON
    const statesFilePath = path.join(__dirname, '../../../data/geojson/states.json');
    logger.info(`Loading states from: ${statesFilePath}`);
    const statesData = JSON.parse(await fs.readFile(statesFilePath, 'utf8'));
    
    // Load county GeoJSON files
    const countiesDir = path.join(__dirname, '../../../data/geojson/counties');
    const countyFiles = await fs.readdir(countiesDir);
    
    const countiesData: { [state: string]: any } = {};
    for (const file of countyFiles) {
      if (file.endsWith('.json')) {
        const stateAbbr = file.replace('.json', '').toUpperCase();
        const countyFilePath = path.join(countiesDir, file);
        logger.info(`Loading counties for ${stateAbbr} from: ${countyFilePath}`);
        countiesData[stateAbbr] = JSON.parse(await fs.readFile(countyFilePath, 'utf8'));
      }
    }
    
    return { states: statesData, counties: countiesData };
  } catch (error) {
    logger.error('Error loading GeoJSON files:', error);
    throw error;
  }
}

// Create initial data
async function initializeData() {
  try {
    // Check connection
    const connected = await connectToDatabase();
    if (!connected) {
      throw new Error('Failed to connect to database');
    }
    
    // Load GeoJSON data
    const { states, counties } = await loadGeoJSONFiles();
    
    // Create US Map (if it doesn't exist)
    let usMap = await USMap.findOne();
    if (!usMap) {
      logger.info('Creating US Map');
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
    } else {
      logger.info('US Map already exists');
    }
    
    // Create States
    const statePromises = states.features.map(async (stateFeature: any) => {
      const name = stateFeature.properties.NAME;
      const abbreviation = stateFeature.properties.STUSPS;
      
      // Check if state already exists
      const existingState = await State.findOne({ abbreviation });
      if (existingState) {
        logger.info(`State ${name} (${abbreviation}) already exists`);
        return existingState;
      }
      
      // Create state
      logger.info(`Creating state: ${name} (${abbreviation})`);
      return State.create({
        name,
        abbreviation,
        type: 'state',
        parentId: usMap._id,
        geometry: stateFeature.geometry,
        metadata: {
          totalCounties: 0,
          totalProperties: 0,
          statistics: {
            totalTaxLiens: 0,
            totalValue: 0
          }
        }
      });
    });
    
    const statesCreated = await Promise.all(statePromises);
    
    // Create Counties
    for (const stateAbbr in counties) {
      const state = await State.findOne({ abbreviation: stateAbbr });
      if (!state) {
        logger.warn(`State ${stateAbbr} not found, skipping counties`);
        continue;
      }
      
      const countyFeatures = counties[stateAbbr].features;
      
      for (const countyFeature of countyFeatures) {
        const countyName = countyFeature.properties.NAME;
        
        // Check if county already exists
        const existingCounty = await County.findOne({ 
          name: countyName,
          stateId: state._id
        });
        
        if (existingCounty) {
          logger.info(`County ${countyName} in ${stateAbbr} already exists`);
          continue;
        }
        
        // Create county
        logger.info(`Creating county: ${countyName} in ${stateAbbr}`);
        await County.create({
          name: countyName,
          type: 'county',
          parentId: state._id,
          stateId: state._id,
          geometry: countyFeature.geometry,
          metadata: {
            totalProperties: 0,
            statistics: {
              totalTaxLiens: 0,
              totalValue: 0
            },
            searchConfig: {
              lookupMethod: 'account_number',
              searchUrl: stateAbbr === 'MD' && countyName === "St. Mary's" 
                ? 'https://sdat.dat.maryland.gov/RealProperty/'
                : 'https://example.com/search',
              selectors: {
                ownerName: '.owner-name',
                propertyAddress: '.property-address',
                marketValue: '.market-value',
                taxStatus: '.tax-status'
              },
              lienUrl: null
            }
          }
        });
        
        // Update state's county count
        await State.updateOne(
          { _id: state._id },
          { $inc: { 'metadata.totalCounties': 1 } }
        );
      }
    }
    
    // Update US Map counts
    const stateCount = await State.countDocuments();
    const countyCount = await County.countDocuments();
    
    await USMap.updateOne(
      { _id: usMap._id },
      { 
        $set: { 
          'metadata.totalStates': stateCount,
          'metadata.totalCounties': countyCount
        } 
      }
    );
    
    logger.info(`Initialization complete: ${stateCount} states, ${countyCount} counties`);
  } catch (error) {
    logger.error('Error initializing data:', error);
  } finally {
    // Close database connection
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
}

// Run the script
initializeData().then(() => {
  logger.info('Data initialization script completed');
}); 