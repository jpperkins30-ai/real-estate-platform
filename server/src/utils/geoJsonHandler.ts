import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { StateGeometry, CountyGeometry } from '../types/inventory';

// Promisify fs functions
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

/**
 * GeoJSON Handler for processing geographic data for states and counties
 */
export class GeoJsonHandler {
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