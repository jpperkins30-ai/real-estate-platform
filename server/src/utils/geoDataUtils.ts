/**
 * Utilities for loading and initializing geographic data from GeoJSON files
 */

import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import logger from './logger';
import { GeoJSONUtils } from './geoJSONUtils';
import { State, IState } from '../models/state.model';
import { County, ICounty } from '../models/county.model';
import { USMap } from '../models/usmap.model';
import { processCoordinates, createDefaultGeometry } from '../models/geo-schemas';

// Define GeoJSON types
interface GeoJSONFeature {
  type: string;
  properties: {
    NAME: string;
    STATE: string;
    [key: string]: any;
  };
  geometry: {
    type: string;
    coordinates: any[];
  };
}

/**
 * Helper function to slugify a string (convert to URL-friendly format)
 * @param text The text to slugify
 * @returns Slugified text
 */
const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')         // Replace spaces with -
    .replace(/[^\w\-]+/g, '')     // Remove all non-word chars
    .replace(/\-\-+/g, '-')       // Replace multiple - with single -
    .replace(/^-+/, '')           // Trim - from start of text
    .replace(/-+$/, '');          // Trim - from end of text
}

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
    // Updated path to look in the project root's data directory instead of inside server
    const filePath = path.join(__dirname, '../../../data/geojson/states.json');
    logger.info(`Attempting to load states from: ${filePath}`);
    
    try {
      await fs.access(filePath);
    } catch (error) {
      logger.warn(`States GeoJSON file not found at ${filePath}. Using default minimal data.`);
      // Return minimal default data for a few states
      return [
        {
          name: "California",
          abbreviation: "CA",
          geometry: createDefaultGeometry('MultiPolygon')
        },
        {
          name: "Texas",
          abbreviation: "TX",
          geometry: createDefaultGeometry('MultiPolygon')
        },
        {
          name: "New York",
          abbreviation: "NY",
          geometry: createDefaultGeometry('MultiPolygon')
        },
        {
          name: "Florida",
          abbreviation: "FL",
          geometry: createDefaultGeometry('MultiPolygon')
        },
        {
          name: "Maryland",
          abbreviation: "MD",
          geometry: createDefaultGeometry('MultiPolygon')
        }
      ];
    }
    
    const data = await fs.readFile(filePath, 'utf8');
    let geojson = JSON.parse(data);
    
    // Process the GeoJSON to ensure all coordinates are numbers
    geojson = GeoJSONUtils.processGeoJSON(geojson);
    
    logger.info(`Loaded GeoJSON data for ${geojson.features.length} states`);
    
    return geojson.features.map((feature: any) => {
      return {
        name: feature.properties.name || feature.properties.NAME,
        abbreviation: feature.properties.abbreviation || feature.properties.STUSPS || feature.properties.STATE,
        geometry: feature.geometry
      };
    });
  } catch (error) {
    logger.error('Error loading state GeoJSON:', error);
    // Return minimal default data for a few states
    logger.warn('Using default minimal state data due to error');
    return [
      {
        name: "California",
        abbreviation: "CA",
        geometry: createDefaultGeometry('MultiPolygon')
      },
      {
        name: "Texas",
        abbreviation: "TX",
        geometry: createDefaultGeometry('MultiPolygon')
      },
      {
        name: "New York",
        abbreviation: "NY",
        geometry: createDefaultGeometry('MultiPolygon')
      },
      {
        name: "Florida",
        abbreviation: "FL",
        geometry: createDefaultGeometry('MultiPolygon')
      },
      {
        name: "Maryland",
        abbreviation: "MD",
        geometry: createDefaultGeometry('MultiPolygon')
      }
    ];
  }
}

/**
 * Load GeoJSON data for counties from the file system
 * @param stateAbbr State abbreviation (e.g., 'MD', 'TX')
 * @returns Promise with array of county GeoJSON objects for the specified state
 */
export async function loadCountyGeoJSON(stateAbbr: string): Promise<Array<{
  id: string;
  name: string;
  state: string;
  geometry: any;
}>> {
  try {
    // Updated path to look in the project root's data directory instead of inside server
    const filePath = path.join(__dirname, `../../../data/geojson/counties/${stateAbbr.toLowerCase()}.json`);
    logger.info(`Attempting to load counties from: ${filePath}`);
    
    try {
      await fs.access(filePath);
    } catch (error) {
      logger.warn(`County GeoJSON file for ${stateAbbr} not found at ${filePath}`);
      return []; // Return empty array instead of throwing error
    }
    
    const data = await fs.readFile(filePath, 'utf8');
    let geojson = JSON.parse(data);
    
    // Process the GeoJSON to ensure all coordinates are numbers
    geojson = GeoJSONUtils.processGeoJSON(geojson);
    
    logger.info(`Loaded GeoJSON data for ${geojson.features.length} counties in ${stateAbbr}`);
    
    return geojson.features.map((feature: any) => {
      const name = feature.properties.name || feature.properties.NAME;
      
      return {
        id: `${stateAbbr.toLowerCase()}-${slugify(name.toLowerCase())}`,
        name: name,
        state: feature.properties.state || feature.properties.STATE || stateAbbr,
        geometry: feature.geometry
      };
    });
  } catch (error) {
    logger.error(`Error loading county GeoJSON for state ${stateAbbr}:`, error);
    return []; // Return empty array instead of throwing error
  }
}

/**
 * Initialize the database with GeoJSON data for states and counties
 * This should be run once when setting up the application
 */
export async function initializeGeographicData(): Promise<void> {
  try {
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
            totalValue: 0,
            lastUpdated: new Date()
          }
        }
      });
    }
    
    // Load state GeoJSON data - this now handles missing files gracefully
    let stateData: Array<{
      name: string;
      abbreviation: string;
      geometry: any;
    }>;
    try {
      stateData = await loadStateGeoJSON();
      logger.info(`Processing ${stateData.length} states`);
    } catch (error) {
      logger.error('Failed to load state GeoJSON data:', error);
      stateData = []; // Empty array as fallback
    }
    
    // Create or update states
    for (const state of stateData) {
      try {
        // Use new approach: search by ID (lowercase abbreviation) first
        const stateId = state.abbreviation.toLowerCase();
        let existingState = await State.findOne({ id: stateId });
        
        if (!existingState) {
          // As a fallback, try by abbreviation
          existingState = await State.findOne({ abbreviation: state.abbreviation });
        }
        
        if (existingState) {
          // Update existing state with geometry if needed
          if (!existingState.geometry || !existingState.geometry.coordinates || existingState.geometry.coordinates.length === 0) {
            logger.info(`Updating geometry for state: ${state.name}`);
            existingState.geometry = state.geometry;
            await existingState.save();
          }
          
          // Ensure ID is set correctly
          if (!existingState.id) {
            logger.info(`Setting ID for state: ${state.name}`);
            existingState.id = stateId;
            await existingState.save();
          }
        } else {
          // Create new state with explicit ID
          logger.info(`Creating new state: ${state.name}`);
          
          // Process the coordinates for safety
          const processedGeometry = {
            type: state.geometry.type,
            coordinates: processCoordinates(state.geometry.coordinates)
          };
          
          await State.create({
            id: stateId,
            name: state.name,
            abbreviation: state.abbreviation,
            type: 'state',
            parentId: usMap._id.toString(),
            geometry: processedGeometry,
            metadata: {
              totalCounties: 0,
              totalProperties: 0,
              statistics: {
                totalTaxLiens: 0,
                totalValue: 0,
                lastUpdated: new Date()
              }
            }
          });
        }
      } catch (error) {
        logger.error(`Error processing state ${state.name}:`, error);
        // Continue with next state
      }
    }
    
    // Update US Map totalStates count
    const stateCount = await State.countDocuments();
    await USMap.findByIdAndUpdate(usMap._id, {
      'metadata.totalStates': stateCount
    });
    logger.info(`Updated US Map with ${stateCount} states`);
    
    // Load county GeoJSON data for specific states
    // For demonstration, we'll load counties for a predefined list of states
    const statesToLoad = ['MD', 'TX', 'CA', 'FL', 'NY'];
    let totalSuccessfulCounties = 0;
    
    for (const stateAbbr of statesToLoad) {
      try {
        // Find the state by ID (lowercase abbreviation)
        const stateId = stateAbbr.toLowerCase();
        const state = await State.findOne({ id: stateId });
        
        if (state) {
          logger.info(`Loading counties for state: ${stateAbbr}`);
          
          // This now handles missing files gracefully by returning an empty array
          const countyData = await loadCountyGeoJSON(stateAbbr);
          
          if (countyData.length === 0) {
            logger.warn(`No county data found for state ${stateAbbr}`);
            continue; // Skip to next state
          }
          
          // Create or update counties
          for (const county of countyData) {
            try {
              // Try to find existing county first by customId 
              let existingCounty = await County.findOne({ customId: county.id });
              
              // If not found by customId, try by name and stateId
              if (!existingCounty) {
                existingCounty = await County.findOne({ 
                  name: county.name,
                  stateId: state._id
                });
              }
              
              if (existingCounty) {
                // Update existing county with geometry if needed
                if (!existingCounty.geometry || !existingCounty.geometry.coordinates || existingCounty.geometry.coordinates.length === 0) {
                  logger.info(`Updating geometry for county: ${county.name}, ${stateAbbr}`);
                  
                  const processedGeometry = {
                    type: county.geometry.type,
                    coordinates: processCoordinates(county.geometry.coordinates)
                  };
                  
                  existingCounty.geometry = processedGeometry;
                  await existingCounty.save();
                }
                
                // Ensure customId is set correctly
                if (!existingCounty.customId) {
                  logger.info(`Setting customId for county: ${county.name}`);
                  existingCounty.customId = county.id;
                  await existingCounty.save();
                }
                
                // Ensure stateAbbreviation is set
                if (!existingCounty.stateAbbreviation) {
                  existingCounty.stateAbbreviation = stateAbbr;
                  await existingCounty.save();
                }
              } else {
                // Create new county
                logger.info(`Creating new county: ${county.name}, ${stateAbbr}`);
                
                // Process geometry using our coordinate processing function
                const processedGeometry = {
                  type: county.geometry.type,
                  coordinates: processCoordinates(county.geometry.coordinates)
                };
                
                await County.create({
                  customId: county.id,
                  name: county.name,
                  type: 'county',
                  parentId: state.id,
                  stateId: state._id,
                  stateAbbreviation: stateAbbr,
                  geometry: processedGeometry,
                  metadata: {
                    totalProperties: 0,
                    statistics: {
                      totalTaxLiens: 0,
                      totalValue: 0,
                      lastUpdated: new Date()
                    }
                  }
                });
                totalSuccessfulCounties++;
              }
            } catch (error) {
              logger.error(`Error processing county ${county.name} in ${stateAbbr}:`, error);
              // Continue with next county
            }
          }
          
          // Update state totalCounties count
          const countyCount = await County.countDocuments({ stateId: state._id });
          await State.findByIdAndUpdate(state._id, {
            'metadata.totalCounties': countyCount
          });
          logger.info(`Updated state ${stateAbbr} with ${countyCount} counties`);
        } else {
          logger.warn(`State ${stateAbbr} not found in database, skipping county import`);
        }
      } catch (error) {
        logger.error(`Error processing counties for state ${stateAbbr}:`, error);
        // Continue with next state
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
    // We're just logging the error but not throwing it, allowing the server to continue starting
  }
}

/**
 * Checks if the required GeoJSON files exist
 * @returns Promise with boolean indicating if files exist
 */
export async function checkGeoJSONFiles(): Promise<boolean> {
  let allFilesExist = true;
  let foundStatesFile = false;
  let foundCountiesDir = false;
  let foundCountyFile = false;
  
  try {
    // Check if states GeoJSON file exists
    const statesPath = path.join(__dirname, '../../../data/geojson/states.json');
    try {
      await fs.access(statesPath);
      logger.info('States GeoJSON file found');
      foundStatesFile = true;
    } catch (error) {
      logger.warn('States GeoJSON file not found');
      allFilesExist = false;
    }
    
    // Check if county directory exists
    const countiesDir = path.join(__dirname, '../../../data/geojson/counties');
    try {
      await fs.access(countiesDir);
      logger.info('Counties directory found');
      foundCountiesDir = true;
    } catch (error) {
      logger.warn('Counties directory not found');
      allFilesExist = false;
    }
    
    // Check for sample county files if the directory exists
    if (foundCountiesDir) {
      const statesToCheck = ['md', 'tx', 'ca', 'ny', 'fl'];
      let foundAnyCountyFile = false;
      
      for (const state of statesToCheck) {
        const countyPath = path.join(countiesDir, `${state}.json`);
        try {
          await fs.access(countyPath);
          logger.info(`County file found for ${state.toUpperCase()}`);
          foundAnyCountyFile = true;
          foundCountyFile = true;
        } catch (error) {
          logger.warn(`County file not found for ${state.toUpperCase()}`);
        }
      }
      
      if (!foundAnyCountyFile) {
        allFilesExist = false;
      }
    }
    
    if (allFilesExist) {
      logger.info('All required GeoJSON files found');
    } else {
      logger.warn('Some GeoJSON files are missing but will proceed with available data');
    }
    
    return allFilesExist;
  } catch (error) {
    logger.warn('Error checking GeoJSON files:', error);
    return false;
  }
}

/**
 * Creates the directory structure for GeoJSON files
 */
export async function createGeoJSONDirectories(): Promise<void> {
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, '../../../data');
    await fs.mkdir(dataDir, { recursive: true });
    
    // Create geojson directory if it doesn't exist
    const geojsonDir = path.join(dataDir, 'geojson');
    await fs.mkdir(geojsonDir, { recursive: true });
    
    // Create counties directory if it doesn't exist
    const countiesDir = path.join(geojsonDir, 'counties');
    await fs.mkdir(countiesDir, { recursive: true });
    
    logger.info('GeoJSON directories created');
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
    // Find the state by ID (lowercase abbreviation) first
    const stateId = stateAbbr.toLowerCase();
    let state = await State.findOne({ id: stateId });
    
    // If not found by ID, try by abbreviation
    if (!state) {
      state = await State.findOne({ abbreviation: stateAbbr });
    }
    
    if (!state || !state.geometry) {
      throw new Error(`State ${stateAbbr} not found or missing geometry`);
    }
    
    // Use our simplifyGeometry utility from geoJSONUtils
    const simplifiedGeometry = await import('./geoJSONUtils')
      .then(utils => utils.GeoJSONUtils.simplifyGeometry(state.geometry, 0.01));
    
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
    // Find the state by ID (lowercase abbreviation) first
    const stateId = stateAbbr.toLowerCase();
    let state = await State.findOne({ id: stateId });
    
    // If not found by ID, try by abbreviation
    if (!state) {
      state = await State.findOne({ abbreviation: stateAbbr });
    }
    
    if (!state) {
      throw new Error(`State ${stateAbbr} not found`);
    }
    
    // Find counties by stateId
    const counties = await County.find({ stateId: state._id });
    
    // Create a GeoJSON FeatureCollection
    const features = counties.map(county => GeoJSONUtils.objectToGeoJSONFeature(
      county.toObject(),
      {
        state: stateAbbr,
        countyName: county.name,
        customId: county.customId,
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

/**
 * Creates a state from GeoJSON data
 * @param stateData GeoJSON feature for a state
 * @param usMapId ID of the US Map parent
 * @returns Created state or null if creation failed
 */
export const createStateFromGeoJSON = async (stateData: GeoJSONFeature, usMapId: string): Promise<IState | null> => {
  try {
    const stateAbbr = stateData.properties.STATE || stateData.properties.STUSPS;
    const stateName = stateData.properties.NAME;
    
    if (!stateName || !stateAbbr) {
      logger.error(`Missing required properties for state: ${JSON.stringify(stateData.properties)}`);
      return null;
    }

    // Explicitly set the ID based on state abbreviation
    const stateId = stateAbbr.toLowerCase();
    
    // Process the GeoJSON geometry
    let geometry: any = {
      type: stateData.geometry.type,
      coordinates: processCoordinates(stateData.geometry.coordinates)
    };

    // Create a new state with explicit ID
    const newState = new State({
      id: stateId,
      name: stateName,
      abbreviation: stateAbbr,
      type: 'state',
      parentId: usMapId,
      geometry: geometry,
      metadata: {
        totalCounties: 0,
        totalProperties: 0,
        statistics: {
          totalTaxLiens: 0,
          totalValue: 0,
          lastUpdated: new Date()
        }
      }
    });

    // Save the new state
    const savedState = await newState.save();
    logger.info(`Created state: ${stateName} (${stateAbbr}) with ID: ${stateId}`);
    return savedState;
  } catch (error) {
    logger.error(`Error creating state from GeoJSON: ${(error as Error).message}`);
    return null;
  }
};

/**
 * Creates a county from GeoJSON data
 * @param countyData GeoJSON feature for a county
 * @param stateId ID of the parent state
 * @returns Created county or null if creation failed
 */
export const createCountyFromGeoJSON = async (countyData: GeoJSONFeature, stateId: mongoose.Types.ObjectId | string): Promise<ICounty | null> => {
  try {
    const countyName = countyData.properties.NAME;
    const stateAbbr = countyData.properties.STATE;
    
    if (!countyName || !stateAbbr) {
      logger.error(`Missing required properties for county: ${JSON.stringify(countyData.properties)}`);
      return null;
    }
    
    // Get the state for reference
    const state = await State.findById(stateId);
    if (!state) {
      logger.error(`State with ID ${stateId} not found`);
      return null;
    }
    
    // Generate county ID using state abbreviation and county name
    const countyId = `${stateAbbr.toLowerCase()}-${slugify(countyName.toLowerCase())}`;
    
    // Process the GeoJSON geometry
    let geometry: any = {
      type: countyData.geometry.type,
      coordinates: processCoordinates(countyData.geometry.coordinates)
    };

    // Create a new county with customId field
    const newCounty = new County({
      customId: countyId,
      name: countyName,
      type: 'county',
      parentId: state.id,
      stateId: state._id,
      stateAbbreviation: state.abbreviation,
      geometry: geometry,
      metadata: {
        totalProperties: 0,
        statistics: {
          totalTaxLiens: 0,
          totalValue: 0,
          lastUpdated: new Date()
        }
      }
    });

    // Save the new county
    const savedCounty = await newCounty.save();
    logger.info(`Created county: ${countyName} (${stateAbbr}) with ID: ${countyId}`);
    return savedCounty;
  } catch (error) {
    logger.error(`Error creating county from GeoJSON: ${(error as Error).message}`);
    return null;
  }
}; 