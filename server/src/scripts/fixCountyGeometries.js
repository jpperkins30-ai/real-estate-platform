/**
 * Script to fix the format of coordinates in existing county geometries
 * 
 * This script addresses issues where county geometries were stored with string
 * representations of coordinates instead of proper number arrays.
 */

const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');

// Set up MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform';

// Initialize logger
const logger = {
  info: (msg) => console.log(`INFO: ${msg}`),
  error: (msg, err) => console.error(`ERROR: ${msg}`, err),
  warn: (msg) => console.warn(`WARN: ${msg}`)
};

// Function to process raw GeoJSON coordinates
function processRawGeoJSONCoordinates(geometry) {
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
    processedGeometry.coordinates = processedGeometry.coordinates.map((coord) => 
      Array.isArray(coord) ? coord.map(Number) : [Number(coord[0]), Number(coord[1])]
    );
  }
  else if (processedGeometry.type === 'Polygon' || processedGeometry.type === 'MultiLineString') {
    processedGeometry.coordinates = processedGeometry.coordinates.map((ring) => 
      ring.map((coord) => 
        Array.isArray(coord) ? coord.map(Number) : [Number(coord[0]), Number(coord[1])]
      )
    );
  }
  else if (processedGeometry.type === 'MultiPolygon') {
    processedGeometry.coordinates = processedGeometry.coordinates.map((poly) => 
      poly.map((ring) => 
        ring.map((coord) => 
          Array.isArray(coord) ? coord.map(Number) : [Number(coord[0]), Number(coord[1])]
        )
      )
    );
  }

  return processedGeometry;
}

async function fixCountyGeometries() {
  logger.info('Starting County Geometry fix process');
  
  try {
    // Connect to MongoDB
    logger.info('Connecting to MongoDB');
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB');
    
    // Register models
    const CountySchema = new mongoose.Schema({
      id: { type: String, required: true, unique: true },
      name: { type: String, required: true },
      type: { type: String, required: true, default: 'county' },
      parentId: { type: String, required: true },
      stateId: { type: mongoose.Schema.Types.ObjectId, required: true },
      geometry: {
        type: { type: String, required: true, enum: ['Polygon', 'MultiPolygon'] },
        coordinates: { type: Array, required: true }
      },
      metadata: {
        totalProperties: { type: Number, required: true, default: 0 },
        statistics: {
          totalTaxLiens: { type: Number, required: true, default: 0 },
          totalValue: { type: Number, required: true, default: 0 },
          lastUpdated: { type: Date, required: true, default: Date.now }
        }
      },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });
    
    const County = mongoose.models.County || mongoose.model('County', CountySchema);
    
    // Find all counties
    const counties = await County.find({});
    logger.info(`Found ${counties.length} counties to process`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process each county
    for (const county of counties) {
      try {
        const originalGeometry = county.geometry;
        
        // Skip if no geometry
        if (!originalGeometry || !originalGeometry.type) {
          logger.warn(`County ${county.name} has no valid geometry, skipping`);
          continue;
        }
        
        // Process the geometry
        const processedGeometry = processRawGeoJSONCoordinates(originalGeometry);
        
        // Update the county with the processed geometry
        county.geometry = processedGeometry;
        await county.save();
        
        successCount++;
        logger.info(`Successfully updated geometry for county: ${county.name} (${county.id})`);
      } catch (error) {
        errorCount++;
        logger.error(`Error fixing geometry for county ${county.name}:`, error);
      }
    }
    
    logger.info(`County Geometry fix complete: ${successCount} updated, ${errorCount} errors`);
  } catch (error) {
    logger.error('Error in County Geometry fix process:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
}

// Run the script
fixCountyGeometries().catch(err => {
  logger.error('Unhandled error in County Geometry fix process:', err);
  process.exit(1);
}); 