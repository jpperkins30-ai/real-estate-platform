/**
 * Test script to verify the GeoJSON coordinate processing works correctly
 */

const fs = require('fs').promises;
const path = require('path');

// Function to recursively ensure all coordinates are numbers
function ensureNumberCoordinates(coordinates) {
  if (Array.isArray(coordinates)) {
    // If it's an array of numbers (innermost array), convert all to numbers
    if (coordinates.length > 0 && 
        (typeof coordinates[0] === 'number' || 
        (typeof coordinates[0] === 'string' && !isNaN(Number(coordinates[0]))))) {
      return coordinates.map(coord => Number(coord));
    }
    // Otherwise it's a nested array, process each item recursively
    return coordinates.map(item => ensureNumberCoordinates(item));
  }
  // If it's already a number or can be converted to a number, return it
  return typeof coordinates === 'number' ? coordinates : Number(coordinates);
}

// Process a GeoJSON object to ensure all coordinates are numbers
function processGeoJSON(geoJSON) {
  if (!geoJSON || !geoJSON.features) {
    return geoJSON;
  }

  // Process each feature
  const processedFeatures = geoJSON.features.map(feature => {
    // Make a deep copy to avoid modifying the original
    const processedFeature = JSON.parse(JSON.stringify(feature));
    
    // Ensure coordinates are arrays of numbers
    if (processedFeature.geometry && processedFeature.geometry.coordinates) {
      processedFeature.geometry.coordinates = ensureNumberCoordinates(
        processedFeature.geometry.coordinates
      );
    }
    
    return processedFeature;
  });
  
  return {
    ...geoJSON,
    features: processedFeatures
  };
}

// Function to check if all values in an array are numbers (recursively)
function checkAllNumbers(array, path = '') {
  if (!Array.isArray(array)) {
    const isNumber = typeof array === 'number';
    if (!isNumber) {
      console.error(`Non-number value found at ${path}: ${array} (${typeof array})`);
    }
    return isNumber;
  }
  
  return array.every((item, index) => 
    checkAllNumbers(item, path ? `${path}[${index}]` : `[${index}]`)
  );
}

async function testCoordinateProcessing() {
  try {
    console.log('Starting coordinate processing test...');
    
    // Load a sample GeoJSON file
    const filePath = path.join(__dirname, '../../../data/geojson/counties/ca.json');
    const data = await fs.readFile(filePath, 'utf8');
    const geojson = JSON.parse(data);
    
    console.log(`Loaded GeoJSON with ${geojson.features.length} features`);
    
    // Check original coordinates
    console.log('Checking original coordinates...');
    const sample = geojson.features[0];
    console.log(`Sample feature: ${sample.properties.NAME}, ${sample.properties.STATE}`);
    console.log(`Geometry type: ${sample.geometry.type}`);
    console.log(`First few coordinates: ${JSON.stringify(sample.geometry.coordinates[0][0].slice(0, 3))}`);
    
    // Check if original coordinates are all numbers
    const originalAllNumbers = checkAllNumbers(sample.geometry.coordinates);
    console.log(`Original coordinates all numbers: ${originalAllNumbers}`);
    
    // Process the GeoJSON
    console.log('Processing GeoJSON...');
    const processed = processGeoJSON(geojson);
    
    // Check processed coordinates
    console.log('Checking processed coordinates...');
    const processedSample = processed.features[0];
    console.log(`Processed sample: ${processedSample.properties.NAME}, ${processedSample.properties.STATE}`);
    console.log(`Processed geometry type: ${processedSample.geometry.type}`);
    console.log(`Processed first few coordinates: ${JSON.stringify(processedSample.geometry.coordinates[0][0].slice(0, 3))}`);
    
    // Check if processed coordinates are all numbers
    const processedAllNumbers = checkAllNumbers(processedSample.geometry.coordinates);
    console.log(`Processed coordinates all numbers: ${processedAllNumbers}`);
    
    // Verify each coordinate is a number in the processed data
    if (processedAllNumbers) {
      console.log('✓ SUCCESS: All processed coordinates are numbers');
    } else {
      console.error('✗ FAILED: Some processed coordinates are not numbers');
    }
  } catch (error) {
    console.error('Error in processing test:', error);
  }
}

// Run the script
testCoordinateProcessing().then(() => {
  console.log('Coordinate processing test completed');
}).catch(error => {
  console.error('Coordinate processing test failed:', error);
}); 