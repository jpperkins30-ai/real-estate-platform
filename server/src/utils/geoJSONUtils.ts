/**
 * GeoJSON utilities for handling geographic data in the inventory module
 */

import * as turf from '@turf/turf';
import { GeoJSON, Feature, FeatureCollection, Geometry } from 'geojson';

/**
 * Simplifies a GeoJSON geometry to reduce complexity while maintaining shape
 * @param geometry GeoJSON geometry to simplify
 * @param tolerance Simplification tolerance (higher = more simplification)
 * @returns Simplified GeoJSON geometry
 */
export const simplifyGeometry = (geometry: Geometry, tolerance: number = 0.01): Geometry => {
  try {
    if (geometry.type === 'Point') {
      // Points cannot be simplified
      return geometry;
    }
    
    const feature = turf.feature(geometry);
    const simplified = turf.simplify(feature, { tolerance });
    return simplified.geometry;
  } catch (error) {
    console.error('Error simplifying geometry:', error);
    throw error;
  }
};

/**
 * Creates a bounding box for a GeoJSON geometry
 * @param geometry GeoJSON geometry
 * @returns Bounding box as [minX, minY, maxX, maxY]
 */
export const getBoundingBox = (geometry: Geometry): number[] => {
  try {
    const feature = turf.feature(geometry);
    return turf.bbox(feature);
  } catch (error) {
    console.error('Error creating bounding box:', error);
    throw error;
  }
};

/**
 * Calculates the area of a GeoJSON polygon in square kilometers
 * @param geometry GeoJSON polygon geometry
 * @returns Area in square kilometers
 */
export const calculateArea = (geometry: Geometry): number => {
  try {
    if (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon') {
      throw new Error('Geometry must be a Polygon or MultiPolygon');
    }
    
    const feature = turf.feature(geometry);
    return turf.area(feature) / 1000000; // Convert square meters to square kilometers
  } catch (error) {
    console.error('Error calculating area:', error);
    throw error;
  }
};

/**
 * Checks if a point is within a polygon
 * @param point GeoJSON point geometry [longitude, latitude]
 * @param polygon GeoJSON polygon geometry
 * @returns True if point is within polygon
 */
export const isPointInPolygon = (point: number[], polygon: Geometry): boolean => {
  try {
    const pointFeature = turf.point(point);
    const polygonFeature = turf.feature(polygon);
    return turf.booleanPointInPolygon(pointFeature, polygonFeature);
  } catch (error) {
    console.error('Error checking if point is in polygon:', error);
    throw error;
  }
};

/**
 * Combines multiple polygons into a single MultiPolygon
 * @param polygons Array of GeoJSON polygon geometries
 * @returns Combined MultiPolygon geometry
 */
export const combinePolygons = (polygons: Geometry[]): Geometry => {
  try {
    // Convert each polygon to a feature
    const features = polygons.map(polygon => turf.feature(polygon));
    
    // Create a feature collection
    const featureCollection = turf.featureCollection(features);
    
    // Combine polygons
    const combined = turf.combine(featureCollection);
    
    // Extract the MultiPolygon geometry
    return combined.features[0].geometry;
  } catch (error) {
    console.error('Error combining polygons:', error);
    throw error;
  }
};

/**
 * Extracts all counties from a state GeoJSON
 * @param stateGeoJSON GeoJSON FeatureCollection of counties within a state
 * @returns Array of county features
 */
export const extractCountiesFromState = (stateGeoJSON: FeatureCollection): Feature[] => {
  try {
    // Filter features to only include county features
    return stateGeoJSON.features.filter(feature => 
      feature.properties && feature.properties.COUNTY
    );
  } catch (error) {
    console.error('Error extracting counties:', error);
    throw error;
  }
};

/**
 * Converts a database object to a GeoJSON feature
 * @param object Database object with geometry property
 * @param properties Additional properties to include
 * @returns GeoJSON feature
 */
export const objectToGeoJSONFeature = (
  object: any, 
  properties: Record<string, any> = {}
): Feature => {
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
};

/**
 * Converts an array of database objects to a GeoJSON FeatureCollection
 * @param objects Array of database objects with geometry property
 * @returns GeoJSON FeatureCollection
 */
export const objectsToGeoJSONFeatureCollection = (objects: any[]): FeatureCollection => {
  try {
    // Convert each object to a feature
    const features = objects.map(object => objectToGeoJSONFeature(object));
    
    // Create a feature collection
    return {
      type: 'FeatureCollection',
      features
    };
  } catch (error) {
    console.error('Error converting objects to GeoJSON feature collection:', error);
    throw error;
  }
}; 