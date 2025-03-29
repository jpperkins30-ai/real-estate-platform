/**
 * GeoJSON Processing Utility
 * Provides robust functions for handling, validating, and processing GeoJSON data.
 */

import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import logger from './logger';
import { processCoordinates, validateCoordinates, createDefaultGeometry } from '../models/geo-schemas';

/**
 * Ensures all necessary directories exist for GeoJSON data storage
 */
export const ensureGeoDataDirectories = async (): Promise<void> => {
  try {
    // Create main data directory at project root
    const dataDir = path.join(process.cwd(), 'data');
    const geoJsonDir = path.join(dataDir, 'geojson');
    const countiesDir = path.join(geoJsonDir, 'counties');
    
    // Create directories if they don't exist (recursive: true creates all needed parent directories)
    await fs.mkdir(dataDir, { recursive: true });
    await fs.mkdir(geoJsonDir, { recursive: true });
    await fs.mkdir(countiesDir, { recursive: true });
    
    logger.info('Ensured GeoJSON directories exist');
  } catch (error) {
    logger.error(`Error creating GeoJSON directories: ${(error as Error).message}`);
    throw error; // Re-throw to allow caller to handle
  }
};

/**
 * Checks if all required GeoJSON files exist
 * @returns Promise resolving to a boolean indicating if files exist
 */
export const checkGeoJSONFiles = async (): Promise<boolean> => {
  let allFilesExist = true;
  const missingFiles = [];
  
  try {
    // Check if states GeoJSON file exists
    const statesPath = path.join(process.cwd(), 'data', 'geojson', 'states.json');
    try {
      await fs.access(statesPath);
      logger.info('States GeoJSON file found');
    } catch (error) {
      logger.warn('States GeoJSON file not found');
      allFilesExist = false;
      missingFiles.push('states.json');
    }
    
    // Check for sample county files - we'll check a few common ones
    const statesToCheck = ['ca', 'fl', 'ny', 'tx', 'md'];
    let foundAnyCountyFile = false;
    
    for (const state of statesToCheck) {
      const countyPath = path.join(process.cwd(), 'data', 'geojson', 'counties', `${state}.json`);
      try {
        await fs.access(countyPath);
        logger.info(`County file found for ${state.toUpperCase()}`);
        foundAnyCountyFile = true;
      } catch (error) {
        missingFiles.push(`counties/${state}.json`);
      }
    }
    
    if (!foundAnyCountyFile) {
      logger.warn('No county files found in counties directory');
      allFilesExist = false;
    }
    
    if (allFilesExist) {
      logger.info('All essential GeoJSON files found');
    } else {
      logger.warn(`Missing GeoJSON files: ${missingFiles.join(', ')}`);
    }
    
    return allFilesExist;
  } catch (error) {
    logger.error(`Error checking GeoJSON files: ${(error as Error).message}`);
    return false;
  }
};

/**
 * Processes a single GeoJSON feature to ensure coordinates are valid numbers
 * @param feature GeoJSON feature to process
 * @returns Processed feature
 */
export const processFeature = (feature: any): any => {
  if (!feature || !feature.geometry) {
    return feature;
  }
  
  try {
    // Make a deep copy to avoid modifying the original
    const processedFeature = JSON.parse(JSON.stringify(feature));
    
    // Ensure coordinates are arrays of numbers
    if (processedFeature.geometry && processedFeature.geometry.coordinates) {
      processedFeature.geometry.coordinates = processCoordinates(
        processedFeature.geometry.coordinates
      );
    }
    
    return processedFeature;
  } catch (error) {
    logger.error(`Error processing feature coordinates: ${(error as Error).message}`);
    // Return original feature if processing fails
    return feature;
  }
};

/**
 * Processes an entire GeoJSON collection
 * @param geoJSON GeoJSON object to process
 * @returns Processed GeoJSON
 */
export const processGeoJSON = (geoJSON: any): any => {
  if (!geoJSON) {
    logger.warn('Null or undefined GeoJSON provided');
    return geoJSON;
  }
  
  try {
    // Handle feature collections
    if (geoJSON.type === 'FeatureCollection' && Array.isArray(geoJSON.features)) {
      // Process each feature
      const processedFeatures = geoJSON.features.map(processFeature);
      
      return {
        ...geoJSON,
        features: processedFeatures
      };
    }
    
    // Handle single feature
    if (geoJSON.type === 'Feature' && geoJSON.geometry) {
      return processFeature(geoJSON);
    }
    
    // Handle geometry directly
    if (geoJSON.type && geoJSON.coordinates) {
      return {
        ...geoJSON,
        coordinates: processCoordinates(geoJSON.coordinates)
      };
    }
    
    // If we can't determine the type, return as is with a warning
    logger.warn('Unknown GeoJSON structure - returning unprocessed');
    return geoJSON;
  } catch (error) {
    logger.error(`Error processing GeoJSON: ${(error as Error).message}`);
    return geoJSON; // Return original on error
  }
};

/**
 * Loads and processes GeoJSON from a file
 * @param filePath Path to the GeoJSON file
 * @returns Processed GeoJSON or null if file not found or invalid
 */
export const loadGeoJSONFromFile = async (filePath: string): Promise<any> => {
  try {
    logger.info(`Attempting to load from: ${filePath}`);
    try {
      await fs.access(filePath);
    } catch (error) {
      logger.warn(`GeoJSON file not found: ${filePath}`);
      return null;
    }
    
    const fileContent = await fs.readFile(filePath, 'utf8');
    let geoJSON;
    
    try {
      geoJSON = JSON.parse(fileContent);
    } catch (error) {
      logger.error(`Invalid JSON in file ${filePath}: ${(error as Error).message}`);
      return null;
    }
    
    if (geoJSON.type === 'FeatureCollection' && Array.isArray(geoJSON.features)) {
      logger.info(`Loaded GeoJSON data for ${geoJSON.features.length} features`);
    }
    
    // Process and return the GeoJSON
    return processGeoJSON(geoJSON);
  } catch (error) {
    logger.error(`Error loading GeoJSON from ${filePath}: ${(error as Error).message}`);
    return null;
  }
};

/**
 * Creates sample GeoJSON files if they don't exist
 */
export const createSampleGeoJSONFiles = async (): Promise<void> => {
  try {
    // Ensure directories exist
    await ensureGeoDataDirectories();
    
    const statesPath = path.join(process.cwd(), 'data', 'geojson', 'states.json');
    const countiesDir = path.join(process.cwd(), 'data', 'geojson', 'counties');
    
    // Create sample states GeoJSON
    if (!fsSync.existsSync(statesPath)) {
      const sampleStates = {
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "properties": {
              "name": "California",
              "abbreviation": "CA"
            },
            "geometry": {
              "type": "MultiPolygon",
              "coordinates": [[[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]]
            }
          },
          {
            "type": "Feature",
            "properties": {
              "name": "Florida",
              "abbreviation": "FL"
            },
            "geometry": {
              "type": "MultiPolygon",
              "coordinates": [[[[10, 10], [10, 11], [11, 11], [11, 10], [10, 10]]]]
            }
          },
          {
            "type": "Feature",
            "properties": {
              "name": "New York",
              "abbreviation": "NY"
            },
            "geometry": {
              "type": "MultiPolygon",
              "coordinates": [[[[20, 20], [20, 21], [21, 21], [21, 20], [20, 20]]]]
            }
          },
          {
            "type": "Feature",
            "properties": {
              "name": "Texas",
              "abbreviation": "TX"
            },
            "geometry": {
              "type": "MultiPolygon",
              "coordinates": [[[[30, 30], [30, 31], [31, 31], [31, 30], [30, 30]]]]
            }
          },
          {
            "type": "Feature",
            "properties": {
              "name": "Maryland",
              "abbreviation": "MD"
            },
            "geometry": {
              "type": "MultiPolygon",
              "coordinates": [[[[40, 40], [40, 41], [41, 41], [41, 40], [40, 40]]]]
            }
          }
        ]
      };
      
      await fs.writeFile(statesPath, JSON.stringify(sampleStates, null, 2));
      logger.info('Created sample states.json file');
    }
    
    // Create sample county files by state
    const statesToCreate = [
      { abbr: 'ca', name: 'California', counties: ['Los Angeles', 'San Francisco', 'San Diego'] },
      { abbr: 'fl', name: 'Florida', counties: ['Miami-Dade', 'Broward', 'Palm Beach'] },
      { abbr: 'ny', name: 'New York', counties: ['New York', 'Kings', 'Queens'] },
      { abbr: 'tx', name: 'Texas', counties: ['Harris', 'Dallas', 'Travis'] },
      { abbr: 'md', name: 'Maryland', counties: ['Montgomery', 'Baltimore', 'Howard'] }
    ];
    
    for (const state of statesToCreate) {
      const countyPath = path.join(countiesDir, `${state.abbr}.json`);
      
      if (!fsSync.existsSync(countyPath)) {
        // Create sample counties for this state
        const sampleCounties = {
          "type": "FeatureCollection",
          "features": state.counties.map((countyName, index) => ({
            "type": "Feature",
            "properties": {
              "name": countyName,
              "STATE": state.abbr.toUpperCase()
            },
            "geometry": {
              "type": "MultiPolygon",
              "coordinates": [[[[index * 10, index * 10], [index * 10, index * 10 + 1], [index * 10 + 1, index * 10 + 1], [index * 10 + 1, index * 10], [index * 10, index * 10]]]]
            }
          }))
        };
        
        await fs.writeFile(countyPath, JSON.stringify(sampleCounties, null, 2));
        logger.info(`Created sample ${state.abbr}.json county file`);
      }
    }
    
    logger.info('Sample GeoJSON files created or verified');
  } catch (error) {
    logger.error(`Error creating sample GeoJSON files: ${(error as Error).message}`);
    throw error;
  }
};

/**
 * Creates a simple GeoJSON feature from coordinates
 * @param name Feature name
 * @param properties Additional properties
 * @param coordinates Coordinates array
 * @param geometryType Geometry type (default: MultiPolygon)
 * @returns GeoJSON feature
 */
export const createGeoJSONFeature = (
  name: string, 
  properties: Record<string, any> = {}, 
  coordinates: any[] = [], 
  geometryType: string = 'MultiPolygon'
): any => {
  // If coordinates are empty, use default geometry
  if (!coordinates || coordinates.length === 0) {
    const defaultGeometry = createDefaultGeometry(geometryType);
    coordinates = defaultGeometry.coordinates;
  }
  
  return {
    type: 'Feature',
    properties: {
      name,
      ...properties
    },
    geometry: {
      type: geometryType,
      coordinates: processCoordinates(coordinates)
    }
  };
};

/**
 * Simplifies a GeoJSON geometry to reduce complexity
 * @param geometry GeoJSON geometry to simplify
 * @param tolerance Simplification tolerance (0-1)
 * @returns Simplified geometry
 */
export const simplifyGeometry = (geometry: any, tolerance: number = 0.01): any => {
  if (!geometry || !geometry.coordinates) {
    return geometry;
  }
  
  // Handle based on geometry type
  switch (geometry.type) {
    case 'Polygon':
      return {
        ...geometry,
        coordinates: simplifyPolygonCoordinates(geometry.coordinates, tolerance)
      };
    case 'MultiPolygon':
      return {
        ...geometry,
        coordinates: geometry.coordinates.map((polygon: any[]) => 
          simplifyPolygonCoordinates(polygon, tolerance)
        )
      };
    default:
      // For other types, just return as is
      return geometry;
  }
};

/**
 * Helper function to simplify polygon coordinates
 * @param coordinates Polygon coordinates
 * @param tolerance Simplification tolerance
 * @returns Simplified coordinates
 */
const simplifyPolygonCoordinates = (coordinates: any[], tolerance: number): any[] => {
  if (!Array.isArray(coordinates)) return coordinates;
  
  // Process each ring in the polygon
  return coordinates.map(ring => {
    if (!Array.isArray(ring) || ring.length < 4) return ring;
    
    // Basic simplification algorithm (Douglas-Peucker)
    if (tolerance <= 0) return ring;
    
    // This is a minimal implementation - for more complex cases,
    // consider using a library like turf.js
    let simplified = [];
    const len = ring.length;
    
    // Always include the first and last points
    simplified.push(ring[0]);
    
    // Add points where needed based on tolerance
    for (let i = 1; i < len - 1; i++) {
      // Calculate distance from point to line formed by previous and next points
      const p1 = simplified[simplified.length - 1];
      const p2 = ring[i];
      const p3 = ring[i + 1];
      
      // Very simplified distance calculation - not ideal but works for demo
      const d = Math.abs((p3[0] - p1[0]) * (p1[1] - p2[1]) - (p1[0] - p2[0]) * (p3[1] - p1[1]));
      
      // If the distance is greater than tolerance, add this point
      if (d > tolerance) {
        simplified.push(p2);
      }
    }
    
    // Add the last point
    simplified.push(ring[len - 1]);
    
    // Ensure polygon is closed
    if (simplified[0][0] !== simplified[simplified.length - 1][0] || 
        simplified[0][1] !== simplified[simplified.length - 1][1]) {
      simplified.push([...simplified[0]]);
    }
    
    // Ensure we have at least a triangle
    if (simplified.length < 4) {
      return ring; // Return original if simplified too much
    }
    
    return simplified;
  });
};

/**
 * Exports a GeoJSON object to a file
 * @param geoJSON GeoJSON object to save
 * @param filePath Path to save the file
 * @param prettyPrint Whether to pretty-print the JSON
 */
export const saveGeoJSONToFile = async (
  geoJSON: any,
  filePath: string,
  prettyPrint: boolean = true
): Promise<void> => {
  try {
    // Process the GeoJSON before saving
    const processedGeoJSON = processGeoJSON(geoJSON);
    
    // Ensure the directory exists
    const dirPath = path.dirname(filePath);
    await fs.mkdir(dirPath, { recursive: true });
    
    // Write the file
    const content = prettyPrint 
      ? JSON.stringify(processedGeoJSON, null, 2)
      : JSON.stringify(processedGeoJSON);
    
    await fs.writeFile(filePath, content);
    logger.info(`GeoJSON saved to ${filePath}`);
  } catch (error) {
    logger.error(`Error saving GeoJSON to ${filePath}: ${(error as Error).message}`);
    throw error;
  }
}; 