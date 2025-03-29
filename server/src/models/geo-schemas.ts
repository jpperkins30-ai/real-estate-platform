import mongoose from 'mongoose';

/**
 * Shared schema definitions for geographic entities
 * These schemas provide consistent validation and structure across map-related models
 */

// Define a more flexible geometry schema
export const geometrySchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon'],
    required: true
  },
  coordinates: {
    type: mongoose.Schema.Types.Mixed, // Use Mixed type for flexibility with nested arrays
    required: true,
    validate: {
      validator: function(v: any) {
        // Basic validation to ensure it's an array
        return Array.isArray(v);
      },
      message: 'Coordinates must be an array'
    }
  }
}, { _id: false }); // Don't generate IDs for embedded documents

// Define base metadata fields
export const baseMetadataSchema = new mongoose.Schema({
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastModifiedBy: { type: String, default: 'system' }
}, { _id: false });

// Define statistics schema (used by multiple entity types)
export const statisticsSchema = new mongoose.Schema({
  totalTaxLiens: { type: Number, default: 0 },
  totalValue: { type: Number, default: 0 },
  averagePropertyValue: { type: Number },
  lastUpdated: { type: Date, default: Date.now }
}, { _id: false });

// Define state metadata schema
export const stateMetadataSchema = new mongoose.Schema({
  regionalInfo: {
    region: { type: String },
    subregion: { type: String }
  },
  totalCounties: { type: Number, default: 0 },
  totalProperties: { type: Number, default: 0 },
  statistics: statisticsSchema
}, { _id: false }).add(baseMetadataSchema);

// Define county metadata schema
export const countyMetadataSchema = new mongoose.Schema({
  totalProperties: { type: Number, default: 0 },
  statistics: statisticsSchema,
  searchConfig: {
    enabled: { type: Boolean, default: false },
    lookupMethod: { type: String, default: 'web' },
    searchUrl: { type: String },
    lienUrl: { type: String },
    lastRun: { type: Date },
    nextScheduledRun: { type: Date },
    searchCriteria: { type: mongoose.Schema.Types.Mixed },
    notificationSettings: { type: mongoose.Schema.Types.Mixed }
  }
}, { _id: false }).add(baseMetadataSchema);

// Define controller schema (used by multiple entity types)
export const controllerSchema = new mongoose.Schema({
  controllerId: { type: String, required: true },
  controllerType: { type: String, required: true },
  enabled: { type: Boolean, required: true, default: true },
  lastRun: { type: Date },
  nextScheduledRun: { type: Date },
  configuration: { type: mongoose.Schema.Types.Mixed }
}, { _id: false });

/**
 * Helper functions for working with geographic schemas
 */

// Function to set default values for geometry objects
export const createDefaultGeometry = (type = 'MultiPolygon') => {
  // Create minimal valid geometry based on type
  switch (type) {
    case 'Point':
      return { type, coordinates: [0, 0] };
    case 'LineString':
      return { type, coordinates: [[0, 0], [1, 1]] };
    case 'Polygon':
      return { type, coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]] };
    case 'MultiPolygon':
    default:
      return {
        type: 'MultiPolygon',
        coordinates: [[[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]]
      };
  }
};

// Function to validate GeoJSON coordinates at runtime
export const validateCoordinates = (coordinates: any): boolean => {
  if (!Array.isArray(coordinates)) {
    return false;
  }
  
  // Empty coordinates - this is allowed in our system with warnings
  if (coordinates.length === 0) {
    return true;
  }
  
  // Recursive check for nested arrays
  return coordinates.every(item => {
    if (Array.isArray(item)) {
      return validateCoordinates(item);
    }
    // Leaf nodes should be numbers
    return typeof item === 'number';
  });
};

// Function to clean and process coordinates
export const processCoordinates = (coordinates: any[]): any[] => {
  if (!Array.isArray(coordinates)) {
    return [];
  }

  // If empty array, return minimal valid structure based on MultiPolygon type
  if (coordinates.length === 0) {
    return [[[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]];
  }

  // Process nested arrays recursively
  return coordinates.map(item => {
    if (Array.isArray(item)) {
      return processCoordinates(item);
    } else if (typeof item === 'string') {
      // Convert string to number
      return parseFloat(item);
    }
    return item;
  });
}; 