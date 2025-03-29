/**
 * GeoJSON utilities for handling geographic data in the inventory module
 */

import * as turf from '@turf/turf';
import { GeoJSON, Feature, FeatureCollection, Geometry as GeoJSONGeometry } from 'geojson';
import { Geometry as InventoryGeometry } from '../types/inventory';
import { processCoordinates } from '../models/geo-schemas';
import logger from './logger';

// Export the utility functions directly for use in other files
export function objectToGeoJSONFeature(
  object: any, 
  properties: Record<string, any> = {}
): Feature {
  return GeoJSONUtils.objectToGeoJSONFeature(object, properties);
}

export class GeoJSONUtils {
  static createPoint(latitude: number, longitude: number): InventoryGeometry {
    return {
      type: 'Point',
      coordinates: [longitude, latitude]
    };
  }

  static createPolygon(coordinates: number[][]): InventoryGeometry {
    return {
      type: 'Polygon',
      coordinates: [coordinates]
    };
  }

  static createMultiPolygon(coordinates: number[][][]): InventoryGeometry {
    return {
      type: 'MultiPolygon',
      coordinates: coordinates.map(polygon => [polygon]) as unknown as number[][][]
    };
  }

  static isValidGeometry(geometry: InventoryGeometry): boolean {
    if (!geometry || !geometry.type || !geometry.coordinates) {
      return false;
    }

    switch (geometry.type) {
      case 'Point':
        return Array.isArray(geometry.coordinates) && 
               geometry.coordinates.length === 2 &&
               typeof geometry.coordinates[0] === 'number' &&
               typeof geometry.coordinates[1] === 'number';

      case 'Polygon':
        return Array.isArray(geometry.coordinates) &&
               geometry.coordinates.length === 1 &&
               Array.isArray(geometry.coordinates[0]) &&
               geometry.coordinates[0].length >= 4 &&
               geometry.coordinates[0].every(coord => 
                 Array.isArray(coord) && 
                 coord.length === 2 &&
                 typeof coord[0] === 'number' &&
                 typeof coord[1] === 'number'
               );

      case 'MultiPolygon':
        return Array.isArray(geometry.coordinates) &&
               geometry.coordinates.every(polygon =>
                 Array.isArray(polygon) &&
                 polygon.length === 1 &&
                 Array.isArray(polygon[0]) &&
                 polygon[0].length >= 4 &&
                 polygon[0].every(coord =>
                   Array.isArray(coord) &&
                   coord.length === 2 &&
                   typeof coord[0] === 'number' &&
                   typeof coord[1] === 'number'
                 )
               );

      default:
        return false;
    }
  }

  static getBoundingBox(geometry: InventoryGeometry): [number, number, number, number] {
    if (!this.isValidGeometry(geometry)) {
      throw new Error('Invalid geometry');
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    const updateBounds = (coord: number[]) => {
      minX = Math.min(minX, coord[0]);
      minY = Math.min(minY, coord[1]);
      maxX = Math.max(maxX, coord[0]);
      maxY = Math.max(maxY, coord[1]);
    };

    switch (geometry.type) {
      case 'Point':
        updateBounds(geometry.coordinates as number[]);
        break;

      case 'Polygon':
        (geometry.coordinates as number[][][]).forEach(polygon => {
          polygon.forEach(coord => updateBounds(coord));
        });
        break;

      case 'MultiPolygon':
        (geometry.coordinates as unknown as number[][][][]).forEach(polygon => {
          polygon.forEach(ring => {
            ring.forEach(coord => updateBounds(coord));
          });
        });
        break;
    }

    return [minX, minY, maxX, maxY];
  }

  static getCentroid(geometry: InventoryGeometry): [number, number] {
    if (!this.isValidGeometry(geometry)) {
      throw new Error('Invalid geometry');
    }

    let sumX = 0;
    let sumY = 0;
    let count = 0;

    const addPoint = (coord: number[]) => {
      sumX += coord[0];
      sumY += coord[1];
      count++;
    };

    switch (geometry.type) {
      case 'Point':
        addPoint(geometry.coordinates as number[]);
        break;

      case 'Polygon':
        (geometry.coordinates as number[][][]).forEach(polygon => {
          polygon.forEach(coord => addPoint(coord));
        });
        break;

      case 'MultiPolygon':
        (geometry.coordinates as unknown as number[][][][]).forEach(polygon => {
          polygon.forEach(ring => {
            ring.forEach(coord => addPoint(coord));
          });
        });
        break;
    }

    return [sumX / count, sumY / count];
  }

  /**
   * Simplifies a GeoJSON geometry to reduce complexity while maintaining shape
   * @param geometry GeoJSON geometry to simplify
   * @param tolerance Simplification tolerance (higher = more simplification)
   * @returns Simplified GeoJSON geometry
   */
  static simplifyGeometry(geometry: InventoryGeometry, tolerance: number = 0.01): InventoryGeometry {
    try {
      if (geometry.type === 'Point') {
        // Points cannot be simplified
        return geometry;
      }
      
      // Add type assertions to make turf.js happy
      // @ts-ignore - Using more permissive typing to work with turf.js
      const feature = turf.feature(geometry as any);
      // @ts-ignore - Using more permissive typing to work with turf.js
      const simplified = turf.simplify(feature, { tolerance });
      return simplified.geometry as unknown as InventoryGeometry;
    } catch (error) {
      console.error('Error simplifying geometry:', error);
      throw error;
    }
  }

  /**
   * Calculates the area of a GeoJSON polygon in square kilometers
   * @param geometry GeoJSON polygon geometry
   * @returns Area in square kilometers
   */
  static calculateArea(geometry: InventoryGeometry): number {
    try {
      if (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon') {
        throw new Error('Geometry must be a Polygon or MultiPolygon');
      }
      
      // Cast to appropriate GeoJSON type for turf.js
      // @ts-ignore - Using more permissive typing to work with turf.js
      const feature = turf.feature(geometry as any);
      return turf.area(feature) / 1000000; // Convert square meters to square kilometers
    } catch (error) {
      console.error('Error calculating area:', error);
      throw error;
    }
  }

  /**
   * Checks if a point is within a polygon
   * @param point GeoJSON point geometry [longitude, latitude]
   * @param polygon GeoJSON polygon geometry
   * @returns True if point is within polygon
   */
  static isPointInPolygon(point: number[], polygon: InventoryGeometry): boolean {
    try {
      const pointFeature = turf.point(point);
      // Cast polygon to appropriate type for turf.js
      // @ts-ignore - Using more permissive typing to work with turf.js
      const polygonFeature = turf.feature(polygon as any);
      return turf.booleanPointInPolygon(pointFeature, polygonFeature);
    } catch (error) {
      console.error('Error checking if point is in polygon:', error);
      throw error;
    }
  }

  /**
   * Combines multiple polygons into a single MultiPolygon
   * @param polygons Array of GeoJSON polygon geometries
   * @returns Combined MultiPolygon geometry
   */
  static combinePolygons(polygons: InventoryGeometry[]): InventoryGeometry {
    try {
      // Convert each polygon to a feature with appropriate casting
      // @ts-ignore - Using more permissive typing to work with turf.js
      const features = polygons.map(polygon => turf.feature(polygon as any));
      
      // Create a feature collection with the correct type
      // @ts-ignore - Using more permissive typing to work with turf.js
      const featureCollection = turf.featureCollection(features);
      
      // Combine polygons
      // @ts-ignore - Using more permissive typing to work with turf.js
      const combined = turf.combine(featureCollection);
      
      // Extract the MultiPolygon geometry and cast back to InventoryGeometry
      return combined.features[0].geometry as unknown as InventoryGeometry;
    } catch (error) {
      console.error('Error combining polygons:', error);
      throw error;
    }
  }

  /**
   * Extracts all counties from a state GeoJSON
   * @param stateGeoJSON GeoJSON FeatureCollection of counties within a state
   * @returns Array of county features
   */
  static extractCountiesFromState(stateGeoJSON: FeatureCollection): Feature[] {
    try {
      // Filter features to only include county features
      return stateGeoJSON.features.filter(feature => 
        feature.properties && feature.properties.COUNTY
      );
    } catch (error) {
      console.error('Error extracting counties:', error);
      throw error;
    }
  }

  /**
   * Converts a database object to a GeoJSON feature
   * @param object Database object with geometry property
   * @param properties Additional properties to include
   * @returns GeoJSON feature
   */
  static objectToGeoJSONFeature(
    object: any, 
    properties: Record<string, any> = {}
  ): Feature {
    try {
      if (!object.geometry) {
        throw new Error('Object must have a geometry property');
      }
      
      // Create the feature with the object's geometry and additional properties
      return {
        type: 'Feature',
        geometry: object.geometry,
        properties: {
          id: object.id,
          name: object.name,
          type: object.type,
          ...properties
        }
      };
    } catch (error) {
      console.error('Error converting object to GeoJSON feature:', error);
      throw error;
    }
  }

  /**
   * Converts an array of database objects to a GeoJSON FeatureCollection
   * @param objects Array of database objects with geometry property
   * @returns GeoJSON FeatureCollection
   */
  static objectsToGeoJSONFeatureCollection(objects: any[]): FeatureCollection {
    try {
      // Convert each object to a feature
      const features = objects.map(object => this.objectToGeoJSONFeature(object));
      
      // Create a feature collection
      return {
        type: 'FeatureCollection',
        features
      };
    } catch (error) {
      console.error('Error converting objects to GeoJSON feature collection:', error);
      throw error;
    }
  }

  /**
   * Process raw GeoJSON coordinates to ensure they are properly formatted
   * as nested arrays of numbers, not strings.
   * 
   * @param geometry The GeoJSON geometry object with type and coordinates
   * @returns Properly formatted geometry with validated number coordinates
   */
  static processRawGeoJSONCoordinates(geometry: any): any {
    if (!geometry || !geometry.type || !geometry.coordinates) {
      return geometry;
    }

    // Create a copy to avoid modifying the original
    const processedGeometry = {
      type: geometry.type,
      coordinates: geometry.coordinates
    };

    // Parse coordinates from JSON string to actual array if needed
    if (typeof processedGeometry.coordinates === 'string') {
      try {
        processedGeometry.coordinates = JSON.parse(processedGeometry.coordinates);
      } catch (e) {
        console.error(`Failed to parse coordinates: ${e}`);
        return geometry; // Return original if parsing fails
      }
    }

    // Process based on geometry type
    if (processedGeometry.type === 'Point') {
      processedGeometry.coordinates = processedGeometry.coordinates.map(Number);
    } 
    else if (processedGeometry.type === 'LineString' || processedGeometry.type === 'MultiPoint') {
      processedGeometry.coordinates = processedGeometry.coordinates.map((coord: any) => 
        Array.isArray(coord) ? coord.map(Number) : [Number(coord[0]), Number(coord[1])]
      );
    }
    else if (processedGeometry.type === 'Polygon' || processedGeometry.type === 'MultiLineString') {
      processedGeometry.coordinates = processedGeometry.coordinates.map((ring: any) => 
        ring.map((coord: any) => 
          Array.isArray(coord) ? coord.map(Number) : [Number(coord[0]), Number(coord[1])]
        )
      );
    }
    else if (processedGeometry.type === 'MultiPolygon') {
      processedGeometry.coordinates = processedGeometry.coordinates.map((poly: any) => 
        poly.map((ring: any) => 
          ring.map((coord: any) => 
            Array.isArray(coord) ? coord.map(Number) : [Number(coord[0]), Number(coord[1])]
          )
        )
      );
    }

    return processedGeometry;
  }

  /**
   * Recursively ensures all coordinates are numbers
   * @param coordinates Coordinates array (can be nested at any level)
   * @returns Coordinates with all values converted to numbers
   */
  static ensureNumberCoordinates(coordinates: any): any {
    if (Array.isArray(coordinates)) {
      // If it's an array of numbers (innermost array), convert all to numbers
      if (coordinates.length > 0 && 
          (typeof coordinates[0] === 'number' || 
          (typeof coordinates[0] === 'string' && !isNaN(Number(coordinates[0]))))) {
        return coordinates.map(coord => Number(coord));
      }
      // Otherwise it's a nested array, process each item recursively
      return coordinates.map(item => GeoJSONUtils.ensureNumberCoordinates(item));
    }
    // If it's already a number or can be converted to a number, return it
    return typeof coordinates === 'number' ? coordinates : Number(coordinates);
  }

  /**
   * Process a GeoJSON object to ensure all coordinates are numbers
   * @param geoJSON The GeoJSON object to process
   * @returns Processed GeoJSON with all coordinates as numbers
   */
  static processGeoJSON(geoJSON: any): any {
    try {
      // Handle feature collections
      if (geoJSON.type === 'FeatureCollection' && Array.isArray(geoJSON.features)) {
        return {
          ...geoJSON,
          features: geoJSON.features.map((feature: any) => this.processFeature(feature))
        };
      }
      
      // Handle single feature
      if (geoJSON.type === 'Feature' && geoJSON.geometry) {
        return this.processFeature(geoJSON);
      }
      
      // Handle geometry directly
      if (geoJSON.type && geoJSON.coordinates) {
        return {
          ...geoJSON,
          coordinates: processCoordinates(geoJSON.coordinates)
        };
      }
      
      // If we can't determine the type, return as is but log a warning
      logger.warn('Unknown GeoJSON format - returning unprocessed');
      return geoJSON;
    } catch (error) {
      logger.error('Error processing GeoJSON:', error);
      return geoJSON; // Return original on error
    }
  }

  /**
   * Process a GeoJSON feature to ensure all coordinates are proper numbers
   * @param feature The GeoJSON feature to process
   * @returns Processed GeoJSON feature
   */
  static processFeature(feature: any): any {
    if (!feature || !feature.geometry) {
      return feature;
    }
    
    return {
      ...feature,
      geometry: {
        ...feature.geometry,
        coordinates: processCoordinates(feature.geometry.coordinates)
      }
    };
  }
} 