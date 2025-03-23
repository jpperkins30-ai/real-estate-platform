/**
 * Proof of Concept for Data Collection and Transformation Pipeline
 * 
 * This script demonstrates:
 * 1. Setting up collectors for different data sources
 * 2. Collecting property data from those sources
 * 3. Processing and standardizing the data
 * 4. Validating and saving the transformed data
 */
import path from 'path';
import fs from 'fs';
import { CollectorManager } from './services/dataCollection/CollectorManager';
import { StMarysCountyCollector } from './services/dataCollection/collectors/StMarysCountyCollector';
import { DataSource, RawPropertyData, StandardizedPropertyData } from './services/dataCollection/types';
import { DataTransformationPipeline } from './services/dataTransformation/pipeline';

// Configure output directories
const OUTPUT_DIR = path.join(process.cwd(), 'data');
const RAW_DATA_DIR = path.join(OUTPUT_DIR, 'raw');
const PROCESSED_DATA_DIR = path.join(OUTPUT_DIR, 'processed');
const ERRORS_DIR = path.join(OUTPUT_DIR, 'errors');

// Ensure output directories exist
[OUTPUT_DIR, RAW_DATA_DIR, PROCESSED_DATA_DIR, ERRORS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Sample data sources for demonstration
 */
const sampleSources: DataSource[] = [
  {
    id: 'stmarys001',
    name: "St. Mary's County Tax Records",
    type: 'county-tax-records',
    url: 'https://stmarysmd.gov/treasurer/realproperty/',
    region: {
      state: 'MD',
      county: "St. Mary's"
    },
    collectorType: 'st-marys-county-md',
    schedule: {
      frequency: 'weekly',
      dayOfWeek: 1 // Monday
    },
    metadata: {},
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  }
] as unknown as DataSource[]; // Type assertion for demo purposes

/**
 * Run the POC end-to-end data pipeline
 */
async function runDemo() {
  console.log('===========================================================');
  console.log('DATA COLLECTION AND TRANSFORMATION PIPELINE DEMONSTRATION');
  console.log('===========================================================\n');

  try {
    // 1. Set up the collector manager
    console.log('Setting up collector manager...');
    const collectorManager = new CollectorManager({
      rateLimitDelay: 500,
      maxConcurrentCollections: 2,
      logLevel: 'info'
    });

    // 2. Register collectors
    console.log('Registering collectors...');
    const stMarysCollector = new StMarysCountyCollector(RAW_DATA_DIR);
    collectorManager.registerCollector(stMarysCollector);

    // 3. Initialize collectors
    console.log('Initializing collectors...');
    await collectorManager.initializeAllCollectors();

    // 4. Execute collection for data sources
    console.log('\nExecuting data collection...');
    const collectionResults = await collectorManager.executeCollections(sampleSources);
    
    console.log('\nCollection Results:');
    collectionResults.forEach((result, index) => {
      console.log(`- Source ${index + 1} (${sampleSources[index].name}): ${result.success ? 'Success' : 'Failed'}`);
      if (result.success) {
        console.log(`  - Collected ${result.data?.length || 0} properties`);
        if (result.metadata?.rawDataPath) {
          console.log(`  - Raw data saved to: ${result.metadata.rawDataPath}`);
        }
      } else {
        console.log(`  - Error: ${result.message}`);
      }
    });

    // 5. Process the collected data
    console.log('\nProcessing collected data...');
    
    // Create the transformation pipeline
    const pipeline = new DataTransformationPipeline();
    
    let totalProcessed = 0;
    let totalSuccess = 0;
    let totalErrors = 0;
    
    // Process each collection result
    for (const result of collectionResults) {
      if (!result.success || !result.metadata?.rawDataPath) {
        console.log(`Skipping failed collection: ${result.sourceId}`);
        continue;
      }
      
      try {
        // Read the raw data
        const rawDataPath = result.metadata.rawDataPath as string;
        const rawDataStr = fs.readFileSync(rawDataPath, 'utf8');
        const rawData = JSON.parse(rawDataStr) as RawPropertyData[];
        
        console.log(`Processing ${rawData.length} properties from ${result.sourceId}...`);
        
        // Process each property
        for (const property of rawData) {
          totalProcessed++;
          
          try {
            // Transform the property data
            const transformed = await pipeline.processData(property, property.source?.id);
            
            // Save the transformed data
            const outputFilename = `property_${transformed.parcelId || transformed.metadata?.sourceId}_${new Date().getTime()}.json`;
            const outputPath = path.join(PROCESSED_DATA_DIR, outputFilename);
            
            fs.writeFileSync(outputPath, JSON.stringify(transformed, null, 2));
            totalSuccess++;
          } catch (error) {
            // Log the error and save to errors directory
            console.error(`Error processing property: ${error instanceof Error ? error.message : String(error)}`);
            
            const errorFilename = `error_${property.source?.id || 'unknown'}_${new Date().getTime()}.json`;
            const errorPath = path.join(ERRORS_DIR, errorFilename);
            
            fs.writeFileSync(errorPath, JSON.stringify({
              error: error instanceof Error ? error.message : String(error),
              property
            }, null, 2));
            
            totalErrors++;
          }
        }
      } catch (error) {
        console.error(`Error reading or parsing raw data: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    // 6. Summary
    console.log('\n===========================================================');
    console.log('PIPELINE EXECUTION SUMMARY');
    console.log('===========================================================');
    console.log(`Total collections attempted: ${sampleSources.length}`);
    console.log(`Successful collections: ${collectionResults.filter(r => r.success).length}`);
    console.log(`Failed collections: ${collectionResults.filter(r => !r.success).length}`);
    console.log(`\nTotal properties processed: ${totalProcessed}`);
    console.log(`Successfully transformed: ${totalSuccess}`);
    console.log(`Errors encountered: ${totalErrors}`);
    console.log('\nOutput locations:');
    console.log(`- Raw data: ${RAW_DATA_DIR}`);
    console.log(`- Processed data: ${PROCESSED_DATA_DIR}`);
    console.log(`- Error logs: ${ERRORS_DIR}`);
    console.log('\nDemonstration complete!');
  } catch (error) {
    console.error('Error in POC demonstration:', error instanceof Error ? error.message : String(error));
  }
}

// Run the demo
runDemo().catch(error => {
  console.error('Unhandled error in POC:', error);
  process.exit(1);
}); 