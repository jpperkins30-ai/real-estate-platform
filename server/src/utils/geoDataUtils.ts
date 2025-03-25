/**
 * Utilities for loading and initializing geographic data from GeoJSON files
 */

import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import logger from './logger';
import { objectToGeoJSONFeature, extractCountiesFromState } from './geoJSONUtils';

/**
 * Load GeoJSON data for states from the file system
 * @returns Promise with array of state GeoJSON objects
 */
export async function loadStateGeoJSON(): Promise<Array<{
  name: string;
  abbreviation: string;
  geometry: any;
}>> {
  try {
    const filePath = path.join(__dirname, '../../data/geojson/states.json');
    const data = await fs.readFile(filePath, 'utf8');
    const geojson = JSON.parse(data);
    
    logger.info(`Loaded GeoJSON data for ${geojson.features.length} states`);
    
    return geojson.features.map((feature: any) => ({
      name: feature.properties.NAME,
      abbreviation: feature.properties.STUSPS,
      geometry: feature.geometry
    }));
  } catch (error) {
    logger.error('Error loading state GeoJSON:', error);
    throw error;
  }
}

/**
 * Load GeoJSON data for counties from the file system
 * @param stateAbbr State abbreviation (e.g., 'MD', 'TX')
 * @returns Promise with array of county GeoJSON objects for the specified state
 */
export async function loadCountyGeoJSON(stateAbbr: string): Promise<Array<{
  name: string;
  state: string;
  geometry: any;
}>> {
  try {
    const filePath = path.join(__dirname, `../../data/geojson/counties/${stateAbbr.toLowerCase()}.json`);
    const data = await fs.readFile(filePath, 'utf8');
    const geojson = JSON.parse(data);
    
    logger.info(`Loaded GeoJSON data for ${geojson.features.length} counties in ${stateAbbr}`);
    
    return geojson.features.map((feature: any) => ({
      name: feature.properties.NAME,
      state: stateAbbr,
      geometry: feature.geometry
    }));
  } catch (error) {
    logger.error(`Error loading county GeoJSON for state ${stateAbbr}:`, error);
    throw error;
  }
}

/**
 * Initialize the database with GeoJSON data for states and counties
 * This should be run once when setting up the application
 */
export async function initializeGeographicData(): Promise<void> {
  try {
    // Get models
    const State = mongoose.model('State');
    const County = mongoose.model('County');
    const USMap = mongoose.model('USMap');
    
    logger.info('Starting geographic data initialization');
    
    // Create or update US Map (root object)
    let usMap = await USMap.findOne();
    if (!usMap) {
      logger.info('Creating US Map root object');
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
    }
    
    // Load state GeoJSON data
    const stateData = await loadStateGeoJSON();
    logger.info(`Processing ${stateData.length} states`);
    
    // Create or update states
    for (const state of stateData) {
      let existingState = await State.findOne({ abbreviation: state.abbreviation });
      
      if (existingState) {
        // Update existing state with geometry if needed
        if (!existingState.geometry) {
          logger.info(`Updating geometry for state: ${state.name}`);
          existingState.geometry = state.geometry;
          await existingState.save();
        }
      } else {
        // Create new state
        logger.info(`Creating new state: ${state.name}`);
        await State.create({
          name: state.name,
          abbreviation: state.abbreviation,
          type: 'state',
          parentId: usMap._id,
          geometry: state.geometry,
          metadata: {
            totalCounties: 0,
            totalProperties: 0,
            statistics: {
              totalTaxLiens: 0,
              totalValue: 0
            }
          }
        });
      }
    }
    
    // Update US Map totalStates count
    const stateCount = await State.countDocuments();
    await USMap.findByIdAndUpdate(usMap._id, {
      'metadata.totalStates': stateCount
    });
    logger.info(`Updated US Map with ${stateCount} states`);
    
    // Load county GeoJSON data for specific states
    // For demonstration, we'll load counties for Maryland and Texas
    const statesToLoad = ['MD', 'TX', 'CA', 'FL', 'NY'];
    
    for (const stateAbbr of statesToLoad) {
      const state = await State.findOne({ abbreviation: stateAbbr });
      
      if (state) {
        logger.info(`Loading counties for state: ${stateAbbr}`);
        const countyData = await loadCountyGeoJSON(stateAbbr);
        
        // Create or update counties
        for (const county of countyData) {
          let existingCounty = await County.findOne({ 
            name: county.name,
            stateId: state._id
          });
          
          if (existingCounty) {
            // Update existing county with geometry if needed
            if (!existingCounty.geometry) {
              logger.info(`Updating geometry for county: ${county.name}, ${stateAbbr}`);
              existingCounty.geometry = county.geometry;
              await existingCounty.save();
            }
          } else {
            // Create new county
            logger.info(`Creating new county: ${county.name}, ${stateAbbr}`);
            await County.create({
              name: county.name,
              type: 'county',
              parentId: state._id,
              stateId: state._id,
              geometry: county.geometry,
              metadata: {
                totalProperties: 0,
                statistics: {
                  totalTaxLiens: 0,
                  totalValue: 0
                },
                searchConfig: null
              }
            });
          }
        }
        
        // Update state totalCounties count
        const countyCount = await County.countDocuments({ stateId: state._id });
        await State.findByIdAndUpdate(state._id, {
          'metadata.totalCounties': countyCount
        });
        logger.info(`Updated state ${stateAbbr} with ${countyCount} counties`);
      }
    }
    
    // Update US Map totalCounties count
    const totalCountyCount = await County.countDocuments();
    await USMap.findByIdAndUpdate(usMap._id, {
      'metadata.totalCounties': totalCountyCount
    });
    
    logger.info(`Geographic data initialization complete with ${totalCountyCount} total counties`);
  } catch (error) {
    logger.error('Error initializing geographic data:', error);
    throw error;
  }
}

/**
 * Checks if the required GeoJSON files exist
 * @returns Promise with boolean indicating if files exist
 */
export async function checkGeoJSONFiles(): Promise<boolean> {
  try {
    // Check if states GeoJSON file exists
    const statesPath = path.join(__dirname, '../../data/geojson/states.json');
    await fs.access(statesPath);
    
    // Check if county directory exists
    const countiesDir = path.join(__dirname, '../../data/geojson/counties');
    await fs.access(countiesDir);
    
    // Check for a sample county file
    const sampleCountyPath = path.join(countiesDir, 'md.json');
    await fs.access(sampleCountyPath);
    
    logger.info('Required GeoJSON files found');
    return true;
  } catch (error) {
    logger.warn('Required GeoJSON files not found:', error);
    return false;
  }
}

/**
 * Creates the directory structure for GeoJSON files
 */
export async function createGeoJSONDirectories(): Promise<void> {
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, '../../data');
    await fs.mkdir(dataDir, { recursive: true });
    
    // Create geojson directory if it doesn't exist
    const geojsonDir = path.join(dataDir, 'geojson');
    await fs.mkdir(geojsonDir, { recursive: true });
    
    // Create counties directory if it doesn't exist
    const countiesDir = path.join(geojsonDir, 'counties');
    await fs.mkdir(countiesDir, { recursive: true });
    
    logger.info('Created directories for GeoJSON files');
  } catch (error) {
    logger.error('Error creating GeoJSON directories:', error);
    throw error;
  }
}

/**
 * Gets a simplified version of a state's geometry
 * @param stateAbbr State abbreviation 
 * @returns Promise with simplified geometry for the state
 */
export async function getSimplifiedStateGeometry(stateAbbr: string): Promise<any> {
  try {
    const State = mongoose.model('State');
    const state = await State.findOne({ abbreviation: stateAbbr });
    
    if (!state || !state.geometry) {
      throw new Error(`State ${stateAbbr} not found or missing geometry`);
    }
    
    // Use our simplifyGeometry utility from geoJSONUtils
    const simplifiedGeometry = await import('./geoJSONUtils')
      .then(utils => utils.simplifyGeometry(state.geometry, 0.01));
    
    return simplifiedGeometry;
  } catch (error) {
    logger.error(`Error getting simplified geometry for state ${stateAbbr}:`, error);
    throw error;
  }
}

/**
 * Gets a GeoJSON FeatureCollection for all counties in a state
 * @param stateAbbr State abbreviation
 * @returns Promise with GeoJSON FeatureCollection
 */
export async function getCountyFeatureCollection(stateAbbr: string): Promise<any> {
  try {
    const State = mongoose.model('State');
    const County = mongoose.model('County');
    
    const state = await State.findOne({ abbreviation: stateAbbr });
    if (!state) {
      throw new Error(`State ${stateAbbr} not found`);
    }
    
    const counties = await County.find({ stateId: state._id });
    
    // Create a GeoJSON FeatureCollection
    const features = counties.map(county => objectToGeoJSONFeature(
      county.toObject(),
      {
        state: stateAbbr,
        countyName: county.name,
        totalProperties: county.metadata?.totalProperties || 0,
        totalTaxLiens: county.metadata?.statistics?.totalTaxLiens || 0,
        totalValue: county.metadata?.statistics?.totalValue || 0
      }
    ));
    
    return {
      type: 'FeatureCollection',
      features
    };
  } catch (error) {
    logger.error(`Error creating county feature collection for state ${stateAbbr}:`, error);
    throw error;
  }
} 