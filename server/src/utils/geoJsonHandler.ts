import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { StateGeometry, CountyGeometry } from '../types/inventory';

// Promisify fs functions
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

/**
 * GeoJsonHandler - Utility class for handling GeoJSON data
 * 
 * This class provides functionality for processing, transforming, and saving
 * GeoJSON data for states and counties in the real estate platform.
 */
export class GeoJsonHandler {
  private dataDirectory: string;

  /**
   * Creates a new GeoJsonHandler instance
   * @param dataDirectory - Directory where GeoJSON files are stored
   */
  constructor(dataDirectory: string = path.join(__dirname, '../../data/geojson')) {
    this.dataDirectory = dataDirectory;
    
    // Ensure the data directory exists
    if (!fs.existsSync(this.dataDirectory)) {
      fs.mkdirSync(this.dataDirectory, { recursive: true });
    }
  }

  /**
   * Parses a GeoJSON file from the given path
   * @param filePath - Path to the GeoJSON file
   * @returns Parsed GeoJSON object
   * @throws Error if file not found or invalid JSON
   */
  public parseGeoJsonFile(filePath: string): any {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Failed to parse GeoJSON file: ${error}`);
    }
  }

  /**
   * Validates if a GeoJSON object has the correct structure
   * @param geoJson - GeoJSON object to validate
   * @returns True if valid, false otherwise
   */
  public validateGeoJson(geoJson: any): boolean {
    if (!geoJson || typeof geoJson !== 'object') {
      return false;
    }
    
    if (!geoJson.type || geoJson.type !== 'FeatureCollection') {
      return false;
    }
    
    if (!Array.isArray(geoJson.features) || geoJson.features.length === 0) {
      return false;
    }
    
    // Check if each feature has geometry and properties
    for (const feature of geoJson.features) {
      if (!feature.type || feature.type !== 'Feature') {
        return false;
      }
      
      if (!feature.geometry || !feature.properties) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Extracts state geometries from a GeoJSON file
   * @param geoJson - GeoJSON object containing state features
   * @returns Array of state features with their geometries
   */
  public extractStateGeometries(geoJson: any): any[] {
    if (!this.validateGeoJson(geoJson)) {
      throw new Error('Invalid GeoJSON format');
    }
    
    // Extract states with geometry and name/properties
    return geoJson.features.map((feature: any) => {
      const state = {
        geometry: feature.geometry,
        properties: {
          name: feature.properties.NAME || feature.properties.name,
          abbreviation: feature.properties.STUSPS || feature.properties.abbreviation,
          // Add other relevant properties
        }
      };
      
      return state;
    });
  }

  /**
   * Extracts county geometries from a GeoJSON file
   * @param geoJson - GeoJSON object containing county features
   * @param stateAbbreviation - State abbreviation to filter counties
   * @returns Array of county features with their geometries
   */
  public extractCountyGeometries(geoJson: any, stateAbbreviation?: string): any[] {
    if (!this.validateGeoJson(geoJson)) {
      throw new Error('Invalid GeoJSON format');
    }
    
    let features = geoJson.features;
    
    // Filter counties by state if provided
    if (stateAbbreviation) {
      features = features.filter((feature: any) => 
        feature.properties.STATE === stateAbbreviation || 
        feature.properties.STATEFP === stateAbbreviation ||
        feature.properties.state === stateAbbreviation
      );
    }
    
    // Extract counties with geometry and name/properties
    return features.map((feature: any) => {
      const county = {
        geometry: feature.geometry,
        properties: {
          name: feature.properties.NAME || feature.properties.name || feature.properties.NAMELSAD,
          stateAbbreviation: feature.properties.STATE || feature.properties.state || stateAbbreviation,
          // Add other relevant properties
        }
      };
      
      return county;
    });
  }

  /**
   * Simplifies a GeoJSON geometry to reduce complexity
   * @param geometry - GeoJSON geometry to simplify
   * @param tolerance - Simplification tolerance (higher values = more simplification)
   * @returns Simplified geometry
   */
  public simplifyGeometry(geometry: any, tolerance: number = 0.01): any {
    if (!geometry || !geometry.type) {
      throw new Error('Invalid geometry');
    }
    
    // Handle different geometry types
    switch (geometry.type) {
      case 'Polygon':
        return {
          type: 'Polygon',
          coordinates: geometry.coordinates.map((ring: any) => this.simplifyPoints(ring, tolerance))
        };
      case 'MultiPolygon':
        return {
          type: 'MultiPolygon',
          coordinates: geometry.coordinates.map((polygon: any) => 
            polygon.map((ring: any) => this.simplifyPoints(ring, tolerance))
          )
        };
      default:
        // Return unchanged for other geometry types
        return geometry;
    }
  }

  /**
   * Simplifies an array of points by keeping only every Nth point
   * @param points - Array of coordinate points
   * @param tolerance - Simplification tolerance
   * @returns Simplified array of points
   */
  private simplifyPoints(points: any[], tolerance: number): any[] {
    // For simplicity, we'll just keep every Nth point
    // The higher the tolerance, the more points we skip
    
    // Ensure first and last points are preserved (to maintain closed polygons)
    if (points.length <= 4) return points;
    
    const skipFactor = Math.max(1, Math.floor(1 / tolerance));
    const result: any[] = [];
    
    // Always include the first point
    result.push(points[0]);
    
    // Keep every Nth point based on skip factor
    for (let i = 1; i < points.length - 1; i++) {
      if (i % skipFactor === 0) {
        result.push(points[i]);
      }
    }
    
    // Always include the last point
    result.push(points[points.length - 1]);
    
    return result;
  }

  /**
   * Saves a GeoJSON object to a file
   * @param geoJson - GeoJSON object to save
   * @param filename - Name of the file to save to
   * @returns Path to the saved file
   */
  public saveGeoJson(geoJson: any, filename: string): string {
    const filePath = path.join(this.dataDirectory, filename);
    
    try {
      fs.writeFileSync(filePath, JSON.stringify(geoJson, null, 2));
      return filePath;
    } catch (error) {
      throw new Error(`Failed to save GeoJSON file: ${error}`);
    }
  }

  /**
   * Loads a GeoJSON file from the data directory
   * @param filename - Name of the file to load
   * @returns Parsed GeoJSON object
   */
  public loadGeoJson(filename: string): any {
    const filePath = path.join(this.dataDirectory, filename);
    return this.parseGeoJsonFile(filePath);
  }

  /**
   * Parse GeoJSON data from a file
   * @param filePath Path to the GeoJSON file
   * @returns Parsed GeoJSON object
   */
  static async parseFromFile(filePath: string): Promise<any> {
    try {
      const fileContent = await readFile(filePath, 'utf8');
      return JSON.parse(fileContent);
    } catch (error) {
      console.error('Error parsing GeoJSON file:', error);
      throw new Error(`Failed to parse GeoJSON file: ${error}`);
    }
  }

  /**
   * Validate if a GeoJSON object has the correct structure
   * @param geoJson GeoJSON object to validate
   * @returns Boolean indicating if the GeoJSON is valid
   */
  static validateGeoJson(geoJson: any): boolean {
    if (!geoJson) return false;
    
    // Check if it's a FeatureCollection
    if (geoJson.type === 'FeatureCollection') {
      if (!Array.isArray(geoJson.features) || geoJson.features.length === 0) {
        return false;
      }
      
      // Check if features have valid geometry
      return geoJson.features.every((feature: any) => 
        feature.type === 'Feature' && 
        feature.geometry && 
        (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') &&
        Array.isArray(feature.geometry.coordinates)
      );
    }
    
    // Check if it's a single Feature
    if (geoJson.type === 'Feature') {
      return (
        geoJson.geometry && 
        (geoJson.geometry.type === 'Polygon' || geoJson.geometry.type === 'MultiPolygon') &&
        Array.isArray(geoJson.geometry.coordinates)
      );
    }
    
    // Check if it's just a Geometry
    if (geoJson.type === 'Polygon' || geoJson.type === 'MultiPolygon') {
      return Array.isArray(geoJson.coordinates);
    }
    
    return false;
  }

  /**
   * Extract state geometries from a GeoJSON file
   * @param geoJson GeoJSON object containing state boundaries
   * @param stateNameProp Property name in the GeoJSON that contains the state name
   * @param stateIdProp Property name in the GeoJSON that contains the state ID
   * @returns Map of state names to their geometries
   */
  static extractStateGeometries(
    geoJson: any, 
    stateNameProp: string = 'NAME', 
    stateIdProp: string = 'STATEFP'
  ): Map<string, StateGeometry> {
    const stateGeometries = new Map<string, StateGeometry>();
    
    if (geoJson.type !== 'FeatureCollection' || !Array.isArray(geoJson.features)) {
      throw new Error('Invalid GeoJSON: Expected a FeatureCollection');
    }
    
    for (const feature of geoJson.features) {
      if (
        feature.type !== 'Feature' || 
        !feature.properties || 
        !feature.geometry || 
        (feature.geometry.type !== 'Polygon' && feature.geometry.type !== 'MultiPolygon')
      ) {
        continue;
      }
      
      const stateName = feature.properties[stateNameProp];
      if (!stateName) continue;
      
      stateGeometries.set(stateName, {
        type: feature.geometry.type as 'Polygon' | 'MultiPolygon',
        coordinates: feature.geometry.coordinates
      });
    }
    
    return stateGeometries;
  }

  /**
   * Extract county geometries from a GeoJSON file
   * @param geoJson GeoJSON object containing county boundaries
   * @param countyNameProp Property name in the GeoJSON that contains the county name
   * @param stateIdProp Property name in the GeoJSON that contains the state ID
   * @param countyIdProp Property name in the GeoJSON that contains the county ID
   * @returns Map of [stateId-countyName] to their geometries
   */
  static extractCountyGeometries(
    geoJson: any, 
    countyNameProp: string = 'NAME', 
    stateIdProp: string = 'STATEFP',
    countyIdProp: string = 'COUNTYFP'
  ): Map<string, CountyGeometry> {
    const countyGeometries = new Map<string, CountyGeometry>();
    
    if (geoJson.type !== 'FeatureCollection' || !Array.isArray(geoJson.features)) {
      throw new Error('Invalid GeoJSON: Expected a FeatureCollection');
    }
    
    for (const feature of geoJson.features) {
      if (
        feature.type !== 'Feature' || 
        !feature.properties || 
        !feature.geometry || 
        (feature.geometry.type !== 'Polygon' && feature.geometry.type !== 'MultiPolygon')
      ) {
        continue;
      }
      
      const countyName = feature.properties[countyNameProp];
      const stateId = feature.properties[stateIdProp];
      const countyId = feature.properties[countyIdProp];
      
      if (!countyName || !stateId) continue;
      
      // Create a compound key of stateId-countyName for uniqueness
      const key = `${stateId}-${countyName}`;
      
      countyGeometries.set(key, {
        type: feature.geometry.type as 'Polygon' | 'MultiPolygon',
        coordinates: feature.geometry.coordinates
      });
    }
    
    return countyGeometries;
  }

  /**
   * Simplify GeoJSON coordinates to reduce file size and improve rendering performance
   * Using a simpler algorithm than Douglas-Peucker for brevity
   * @param geometry Geometry object to simplify
   * @param tolerance Tolerance value for simplification (higher = more simplification)
   * @returns Simplified geometry object
   */
  static simplifyGeometry(geometry: StateGeometry | CountyGeometry, tolerance: number = 0.001): StateGeometry | CountyGeometry {
    // Simple algorithm: Keep every Nth point
    const skipFactor = Math.max(1, Math.floor(1 / tolerance));
    
    const simplifyPoints = (points: number[][]): number[][] => {
      // Always keep first and last points
      if (points.length <= 2) return points;
      
      const result: number[][] = [points[0]];
      
      for (let i = 1; i < points.length - 1; i += skipFactor) {
        result.push(points[i]);
      }
      
      // Add the last point if it's not already included
      if (result[result.length - 1] !== points[points.length - 1]) {
        result.push(points[points.length - 1]);
      }
      
      return result;
    };
    
    if (geometry.type === 'Polygon') {
      return {
        type: 'Polygon',
        coordinates: geometry.coordinates.map(simplifyPoints)
      };
    } else { // MultiPolygon
      return {
        type: 'MultiPolygon',
        coordinates: geometry.coordinates.map(polygon => 
          polygon.map(simplifyPoints)
        )
      };
    }
  }

  /**
   * Save a GeoJSON object to a file
   * @param geoJson GeoJSON object to save
   * @param filePath Path to save the file to
   */
  static async saveToFile(geoJson: any, filePath: string): Promise<void> {
    try {
      const dirPath = path.dirname(filePath);
      
      // Ensure the directory exists
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      await writeFile(filePath, JSON.stringify(geoJson), 'utf8');
    } catch (error) {
      console.error('Error saving GeoJSON file:', error);
      throw new Error(`Failed to save GeoJSON file: ${error}`);
    }
  }

  /**
   * Find the bounding box of a geometry
   * @param geometry Geometry object to find the bounding box for
   * @returns Bounding box as [minLng, minLat, maxLng, maxLat]
   */
  static getBoundingBox(geometry: StateGeometry | CountyGeometry): [number, number, number, number] {
    let minLng = Infinity;
    let minLat = Infinity;
    let maxLng = -Infinity;
    let maxLat = -Infinity;
    
    const processPoint = (point: number[]) => {
      const [lng, lat] = point;
      minLng = Math.min(minLng, lng);
      minLat = Math.min(minLat, lat);
      maxLng = Math.max(maxLng, lng);
      maxLat = Math.max(maxLat, lat);
    };
    
    const processRing = (ring: number[][]) => {
      ring.forEach(processPoint);
    };
    
    if (geometry.type === 'Polygon') {
      geometry.coordinates.forEach(processRing);
    } else { // MultiPolygon
      geometry.coordinates.forEach(polygon => {
        polygon.forEach(processRing);
      });
    }
    
    return [minLng, minLat, maxLng, maxLat];
  }

  /**
   * Calculate the center point of a geometry
   * @param geometry Geometry object to find the center for
   * @returns Center point as [lng, lat]
   */
  static getCenter(geometry: StateGeometry | CountyGeometry): [number, number] {
    const bbox = this.getBoundingBox(geometry);
    const centerLng = (bbox[0] + bbox[2]) / 2;
    const centerLat = (bbox[1] + bbox[3]) / 2;
    return [centerLng, centerLat];
  }
} 