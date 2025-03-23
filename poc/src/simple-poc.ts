// Add at the beginning of the file to force console output
console.log("Script starting...");

import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs-extra';
import * as path from 'path';

// Simple logger implementation
const logger = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  warn: (message: string) => console.warn(`[WARN] ${message}`),
  error: (message: string) => console.error(`[ERROR] ${message}`),
  debug: (message: string) => console.log(`[DEBUG] ${message}`)
};

console.log("Imports loaded successfully.");

// Configuration
const CONFIG = {
  baseUrl: 'https://www.stmaryscountymd.gov/Treasurer/TaxSale/',
  outputDir: path.resolve(__dirname, '../data')
};

// Print debug information
console.log(`__dirname: ${__dirname}`);
console.log(`Output directory: ${CONFIG.outputDir}`);

// Types
interface RawPropertyData {
  [key: string]: any;
}

interface StandardizedPropertyData {
  parcelId: string;
  ownerName: string;
  propertyAddress: string;
  propertyType: string;
  city: string;
  state: string;
  county: string;
  saleInfo: {
    saleType: string;
    saleAmount: number;
  };
  location?: {
    latitude: number;
    longitude: number;
    formattedAddress: string;
  };
  lastUpdated: string;
}

console.log("Starting POC execution...");

/**
 * Main execution function for the POC
 */
async function runPoc() {
  console.log('Starting St. Mary\'s County Data Collection POC');
  
  try {
    console.log('Creating directories...');
    // Create output directories
    await createDirectories();
    
    console.log('Fetching property data...');
    // Fetch and parse property data
    const propertyData = await fetchPropertyData();
    console.log(`Fetched ${propertyData.length} properties.`);
    
    console.log('Saving and processing property data...');
    // Save and process data
    const result = await savePropertyData(propertyData);
    console.log(`Processing result: ${JSON.stringify(result, null, 2)}`);
    
    console.log('Generating report...');
    // Generate a report
    await generateReport(propertyData, result);
    
    console.log('POC completed successfully');
  } catch (error: any) {
    console.error(`POC failed: ${error.message}`);
    if (error.stack) {
      console.error(`Stack trace: ${error.stack}`);
    }
    process.exit(1);
  }
}

/**
 * Create necessary directories for output files
 */
async function createDirectories() {
  console.log("Inside createDirectories()");
  
  try {
    const dirs = [
      path.join(CONFIG.outputDir, 'raw'),
      path.join(CONFIG.outputDir, 'processed'),
      path.join(CONFIG.outputDir, 'reports')
    ];
    
    for (const dir of dirs) {
      console.log(`Ensuring directory exists: ${dir}`);
      
      try {
        const dirExists = await fs.pathExists(dir);
        console.log(`Directory ${dir} exists: ${dirExists}`);
        
        if (!dirExists) {
          console.log(`Creating directory: ${dir}`);
          await fs.ensureDir(dir);
          console.log(`Created directory: ${dir}`);
        }
      } catch (err: any) {
        console.error(`Error with directory ${dir}: ${err.message}`);
        throw err;
      }
    }
    
    console.log("All directories created/verified successfully");
  } catch (err: any) {
    console.error(`Error in createDirectories: ${err.message}`);
    throw err;
  }
}

/**
 * Fetch property data from St. Mary's County website
 * For the POC, we'll simulate data if we can't access the real site
 */
async function fetchPropertyData(): Promise<RawPropertyData[]> {
  try {
    console.log(`Fetching data from ${CONFIG.baseUrl}`);
    
    // Try to fetch the actual data
    const response = await axios.get(CONFIG.baseUrl, {
      timeout: 10000
    });
    
    return parsePropertyDataFromHtml(response.data);
  } catch (error: any) {
    console.warn(`Could not fetch real data: ${error.message}`);
    console.info('Generating simulated property data for POC');
    
    // Generate sample data for the POC
    return generateSamplePropertyData();
  }
}

/**
 * Parse property data from HTML
 */
function parsePropertyDataFromHtml(html: string): RawPropertyData[] {
  const $ = cheerio.load(html);
  const properties: RawPropertyData[] = [];
  
  // Find the table with property data
  const table = $('table').first();
  
  if (table.length === 0) {
    console.warn('NO ACTIVE SALE AT THIS TIME - No property table found on the website');
    console.log('Falling back to simulated data for demonstration purposes');
    return generateSamplePropertyData();
  }
  
  // Extract headers
  const headers: string[] = [];
  table.find('th').each((i, el) => {
    headers.push($(el).text().trim());
  });
  
  // Extract rows
  table.find('tr').slice(1).each((i, row) => {
    const property: RawPropertyData = {};
    
    $(row).find('td').each((j, cell) => {
      if (j < headers.length) {
        property[headers[j]] = $(cell).text().trim();
      }
    });
    
    if (Object.keys(property).length > 0) {
      properties.push(property);
    }
  });
  
  if (properties.length === 0) {
    console.warn('NO ACTIVE SALE AT THIS TIME - Table exists but contains no properties');
    console.log('Falling back to simulated data for demonstration purposes');
    return generateSamplePropertyData();
  }
  
  console.info(`Extracted ${properties.length} properties from HTML`);
  return properties;
}

/**
 * Generate sample property data for POC
 */
function generateSamplePropertyData(): RawPropertyData[] {
  const properties: RawPropertyData[] = [];
  const propertyTypes = ['Residential', 'Commercial', 'Vacant Land', 'Industrial'];
  const streets = ['Main St', 'Oak Ave', 'Maple Rd', 'Washington Blvd', 'Park Place'];
  
  for (let i = 1; i <= 20; i++) {
    const property: RawPropertyData = {
      'Tax Acct#': `08-${String(i).padStart(5, '0')}`,
      'Owner': `Sample Owner ${i}`,
      'Address': `${100 + i} ${streets[i % streets.length]}, Leonardtown, MD 20650`,
      'Description': `${propertyTypes[i % propertyTypes.length]} property`,
      'Amount Due': (1000 + (i * 1500)).toFixed(2)
    };
    
    properties.push(property);
  }
  
  console.info(`Generated ${properties.length} sample properties`);
  return properties;
}

/**
 * Simulate geocoding for an address
 */
function simulateGeocode(address: string): { latitude: number; longitude: number; formattedAddress: string } {
  // Generate a realistic-looking coordinate in Maryland
  // Maryland is roughly between 37.9-39.7°N, 75.0-79.5°W
  const baseLatitude = 38.3;  // St. Mary's County is around this latitude
  const baseLongitude = -76.8; // St. Mary's County is around this longitude
  
  // Generate slight randomness to the coordinates
  const randomLatitude = baseLatitude + (Math.random() * 0.5 - 0.25);
  const randomLongitude = baseLongitude + (Math.random() * 0.5 - 0.25);
  
  return {
    latitude: parseFloat(randomLatitude.toFixed(6)),
    longitude: parseFloat(randomLongitude.toFixed(6)),
    formattedAddress: address // In a real implementation, this would be improved by the geocoding service
  };
}

/**
 * Determine property type from description
 */
function determinePropertyType(description?: string): string {
  if (!description) return 'Unknown';
  
  const desc = description.toLowerCase();
  if (desc.includes('vacant') || desc.includes('land')) {
    return 'Vacant Land';
  } else if (desc.includes('commercial')) {
    return 'Commercial';
  } else if (desc.includes('residential')) {
    return 'Residential';
  } else if (desc.includes('industrial')) {
    return 'Industrial';
  }
  
  return 'Unknown';
}

/**
 * Save property data to files
 */
async function savePropertyData(properties: RawPropertyData[]) {
  if (!properties || properties.length === 0) {
    console.warn('No property data to save');
    return {
      rawCount: 0,
      processedCount: 0
    };
  }
  
  // Generate file name with timestamp
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const rawFileName = `MD_StMarys_${timestamp}_raw.json`;
  const processedFileName = `MD_StMarys_${timestamp}_processed.json`;
  
  // Save raw data
  const rawFilePath = path.join(CONFIG.outputDir, 'raw', rawFileName);
  await fs.writeJson(rawFilePath, properties, { spaces: 2 });
  console.info(`Saved raw data to ${rawFilePath}`);
  
  // Process data - this simulates the transformation pipeline
  const processedProperties: StandardizedPropertyData[] = [];
  
  for (const property of properties) {
    try {
      // Standardize the property data
      const standardizedProperty: StandardizedPropertyData = {
        parcelId: property['Tax Acct#'],
        ownerName: property['Owner'],
        propertyAddress: property['Address'],
        propertyType: determinePropertyType(property['Description']),
        city: 'Leonardtown', // Assumed for POC
        state: 'MD',
        county: "St. Mary's",
        saleInfo: {
          saleType: 'Tax Lien',
          saleAmount: parseFloat(property['Amount Due'].replace(/,/g, ''))
        },
        lastUpdated: new Date().toISOString()
      };
      
      // Simulate geocoding (would connect to a real geocoding service in production)
      if (standardizedProperty.propertyAddress) {
        const geocodingResult = simulateGeocode(standardizedProperty.propertyAddress);
        standardizedProperty.location = geocodingResult;
      }
      
      processedProperties.push(standardizedProperty);
    } catch (error: any) {
      console.error(`Error processing property ${property['Tax Acct#']}: ${error.message}`);
    }
  }
  
  // Save processed data
  const processedFilePath = path.join(CONFIG.outputDir, 'processed', processedFileName);
  await fs.writeJson(processedFilePath, processedProperties, { spaces: 2 });
  console.info(`Saved processed data to ${processedFilePath}`);
  
  return {
    rawFilePath,
    processedFilePath,
    rawCount: properties.length,
    processedCount: processedProperties.length
  };
}

/**
 * Generate a summary report
 */
async function generateReport(rawProperties: RawPropertyData[], processResults: any) {
  if (!rawProperties || rawProperties.length === 0) {
    console.warn('No property data for report');
    return;
  }
  
  // Analyze property types
  const propertyTypes: Record<string, number> = {};
  let totalAmount = 0;
  let minAmount = Number.MAX_VALUE;
  let maxAmount = 0;
  
  for (const property of rawProperties) {
    // Count property types
    const type = determinePropertyType(property['Description']);
    propertyTypes[type] = (propertyTypes[type] || 0) + 1;
    
    // Track sale amounts
    const amount = parseFloat(property['Amount Due'].replace(/,/g, ''));
    totalAmount += amount;
    minAmount = Math.min(minAmount, amount);
    maxAmount = Math.max(maxAmount, amount);
  }
  
  // Create report
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalProperties: rawProperties.length,
      processedProperties: processResults.processedCount,
      propertyTypes,
      amounts: {
        total: totalAmount,
        average: totalAmount / rawProperties.length,
        min: minAmount,
        max: maxAmount
      }
    },
    dataSources: [
      {
        name: "St. Mary's County Tax Records",
        state: "MD",
        county: "St. Mary's",
        description: "Property tax sale records from St. Mary's County, Maryland",
        url: CONFIG.baseUrl,
        collectedAt: new Date().toISOString(),
        dataNote: "This data may be simulated if no active tax sale was found"
      }
    ]
  };
  
  // Save report
  const reportPath = path.join(CONFIG.outputDir, 'reports', `report-${timestamp}.json`);
  await fs.writeJson(reportPath, report, { spaces: 2 });
  console.log(`Generated report at ${reportPath}`);
  
  // Display summary
  console.log('=== Collection Summary ===');
  console.log(`Total Properties: ${rawProperties.length}`);
  console.log(`Processed Properties: ${processResults.processedCount}`);
  
  for (const [type, count] of Object.entries(propertyTypes)) {
    console.log(`${type}: ${count} properties`);
  }
  
  console.log(`Average Amount Due: $${(totalAmount / rawProperties.length).toFixed(2)}`);
  console.log(`Amount Range: $${minAmount.toFixed(2)} - $${maxAmount.toFixed(2)}`);
}

// Run the POC
console.log("Calling runPoc()...");
runPoc().catch(err => {
  console.error('Unhandled error in POC execution:', err);
  process.exit(1);
}); 