import mongoose from 'mongoose';
import logger from './logger';
import USMap from '../models/usmap.model';
import State from '../models/state.model';
import County from '../models/county.model';
import {
  ensureGeoDataDirectories,
  loadGeoJSONFromFile,
  createSampleGeoJSONFiles,
  processGeoJSON
} from './geoJsonProcessor';
import path from 'path';

// Initialize USMap
export const initUSMap = async (): Promise<mongoose.Types.ObjectId | null> => {
  try {
    logger.info('Initializing US Map...');
    
    // Check if US Map exists
    let usMap = await USMap.findOne({});
    
    if (!usMap) {
      logger.info('US Map not found, creating default');
      
      // Create default US Map
      usMap = new USMap({
        name: 'US Map',
        type: 'us_map',
        geometry: {
          type: 'MultiPolygon',
          coordinates: []
        },
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
      
      // Save the new US Map
      await usMap.save();
      logger.info('Default US Map created successfully');
    } else {
      logger.info('US Map already exists');
    }
    
    return usMap._id;
  } catch (error) {
    logger.error(`Error initializing US Map: ${(error as Error).message}`);
    return null;
  }
};

// Initialize states from GeoJSON
export const initStates = async (usMapId: mongoose.Types.ObjectId | null): Promise<Map<string, mongoose.Types.ObjectId>> => {
  const stateMap = new Map<string, mongoose.Types.ObjectId>();
  
  if (!usMapId) {
    logger.error('Cannot initialize states: USMap ID is null');
    return stateMap;
  }
  
  try {
    logger.info('Initializing states...');
    
    // Load states GeoJSON
    const statesPath = path.join(process.cwd(), 'data', 'geojson', 'states.json');
    const statesGeoJSON = await loadGeoJSONFromFile(statesPath);
    
    if (!statesGeoJSON || !statesGeoJSON.features) {
      logger.warn('No states GeoJSON found or invalid format');
      return stateMap;
    }
    
    // Process each state feature
    for (const feature of statesGeoJSON.features) {
      // Skip invalid features
      if (!feature || !feature.properties) {
        logger.warn('Skipping invalid state feature');
        continue;
      }
      
      const name = feature.properties.name || feature.properties.NAME;
      const abbreviation = feature.properties.abbreviation || feature.properties.STATEABBR || feature.properties.STATE;
      
      if (!name || !abbreviation) {
        logger.warn(`Skipping state feature with missing name or abbreviation`);
        continue;
      }
      
      // Check if state already exists
      let state = await State.findOne({ abbreviation: abbreviation.toUpperCase() });
      
      if (!state) {
        logger.info(`Creating state: ${name} (${abbreviation})`);
        
        // Create new state with explicit ID
        try {
          state = new State({
            name,
            abbreviation: abbreviation.toUpperCase(),
            type: 'state',
            parentId: usMapId,
            geometry: processGeoJSON(feature.geometry),
            metadata: {
              regionalInfo: {
                region: feature.properties.region || '',
                subregion: feature.properties.subregion || ''
              },
              totalCounties: 0,
              totalProperties: 0,
              statistics: {
                totalTaxLiens: 0,
                totalValue: 0
              }
            }
          });
          
          await state.save();
          logger.info(`State created: ${name} (${abbreviation})`);
        } catch (stateError) {
          logger.error(`Error creating state ${name}: ${(stateError as Error).message}`);
          continue;
        }
      } else {
        logger.info(`State already exists: ${name} (${abbreviation})`);
      }
      
      // Add to state map for county reference
      if (state && state._id) {
        stateMap.set(abbreviation.toUpperCase(), state._id);
      }
    }
    
    // Update USMap totalStates
    await USMap.findByIdAndUpdate(usMapId, {
      'metadata.totalStates': stateMap.size
    });
    
    logger.info(`Initialized ${stateMap.size} states`);
    return stateMap;
  } catch (error) {
    logger.error(`Error initializing states: ${(error as Error).message}`);
    return stateMap;
  }
};

// Initialize counties from state-specific GeoJSON files
export const initCounties = async (stateMap: Map<string, mongoose.Types.ObjectId>): Promise<void> => {
  if (stateMap.size === 0) {
    logger.error('Cannot initialize counties: No states available');
    return;
  }
  
  try {
    logger.info('Initializing counties...');
    
    // Track counties per state for statistics
    const countiesPerState = new Map<string, number>();
    let totalCountiesCreated = 0;
    let totalCountiesProcessed = 0;
    
    // Process counties for each state
    for (const [stateAbbr, stateId] of stateMap.entries()) {
      const stateAbbrevLower = stateAbbr.toLowerCase();
      const countyFilePath = path.join(process.cwd(), 'data', 'geojson', 'counties', `${stateAbbrevLower}.json`);
      
      try {
        // Load counties GeoJSON for this state
        const countiesGeoJSON = await loadGeoJSONFromFile(countyFilePath);
        
        if (!countiesGeoJSON || !countiesGeoJSON.features || !countiesGeoJSON.features.length) {
          logger.warn(`No county data found for state ${stateAbbr} or invalid format`);
          continue;
        }
        
        logger.info(`Processing ${countiesGeoJSON.features.length} counties for ${stateAbbr}`);
        
        // Process each county feature
        for (const feature of countiesGeoJSON.features) {
          totalCountiesProcessed++;
          
          // Skip invalid features
          if (!feature || !feature.properties) {
            logger.warn(`Skipping invalid county feature for state ${stateAbbr}`);
            continue;
          }
          
          // Get county name from properties - support multiple property formats
          const countyName = feature.properties.name || feature.properties.NAME || feature.properties.COUNTY;
          
          if (!countyName) {
            logger.warn(`Skipping county with missing name in state ${stateAbbr}`);
            continue;
          }
          
          // Generate a county customId for lookup
          const countyId = `${stateAbbrevLower}-${countyName.toLowerCase().replace(/\s+/g, '-')}`;
          
          // Check if county already exists
          const existingCounty = await County.findOne({ 
            customId: countyId
          });
          
          if (!existingCounty) {
            logger.info(`Creating county: ${countyName} (${stateAbbr})`);
            
            // Create new county
            try {
              const county = new County({
                customId: countyId,
                name: countyName,
                type: 'county',
                parentId: stateId,
                stateId: stateId,
                stateAbbreviation: stateAbbr,
                geometry: processGeoJSON(feature.geometry),
                metadata: {
                  totalProperties: 0,
                  statistics: {
                    totalTaxLiens: 0,
                    totalValue: 0
                  },
                  searchConfig: {
                    enabled: false,
                    lookupMethod: feature.properties.lookupMethod || 'web',
                    searchUrl: feature.properties.searchUrl || '',
                    lienUrl: feature.properties.lienUrl || ''
                  }
                }
              });
              
              await county.save();
              logger.info(`County created: ${countyName} (${stateAbbr}) with ID: ${countyId}`);
              totalCountiesCreated++;
              
              // Increment county count for this state
              const currentCount = countiesPerState.get(stateAbbr) || 0;
              countiesPerState.set(stateAbbr, currentCount + 1);
            } catch (countyError) {
              logger.error(`Error processing county ${countyName} in ${stateAbbr}: ${(countyError as Error).message}`);
            }
          } else {
            logger.info(`County already exists: ${countyName} (${stateAbbr})`);
            // Still count existing counties
            const currentCount = countiesPerState.get(stateAbbr) || 0;
            countiesPerState.set(stateAbbr, currentCount + 1);
          }
        }
      } catch (stateCountyError) {
        logger.error(`Error processing counties for state ${stateAbbr}: ${(stateCountyError as Error).message}`);
      }
    }
    
    // Update state county counts
    for (const [stateAbbr, count] of countiesPerState.entries()) {
      const stateId = stateMap.get(stateAbbr);
      if (stateId) {
        await State.findByIdAndUpdate(stateId, {
          'metadata.totalCounties': count
        });
        logger.info(`Updated state ${stateAbbr} with ${count} counties`);
      }
    }
    
    // Update USMap totalCounties
    const totalCounties = await County.countDocuments();
    await USMap.findOneAndUpdate({}, {
      'metadata.totalCounties': totalCounties
    });
    
    logger.info(`Geographic data initialization complete with ${totalCounties} total counties`);
  } catch (error) {
    logger.error(`Error initializing counties: ${(error as Error).message}`);
  }
};

// Main initialization function
export const initGeoData = async (): Promise<void> => {
  try {
    logger.info('Starting geographic data initialization');
    
    // Ensure MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      logger.error('MongoDB not connected, aborting geographic data initialization');
      return;
    }
    logger.info('Connected to MongoDB');
    
    // Ensure data directories exist
    await ensureGeoDataDirectories();
    logger.info('GeoJSON directories verified');
    
    // Create sample GeoJSON files if needed
    await createSampleGeoJSONFiles();
    logger.info('Sample GeoJSON files created if needed');
    
    // Initialize the hierarchy
    const usMapId = await initUSMap();
    const stateMap = await initStates(usMapId);
    await initCounties(stateMap);
    
    logger.info('Geographic data initialization complete');
  } catch (error) {
    logger.error(`Error in geographic data initialization: ${(error as Error).message}`);
  }
};

export default initGeoData; 