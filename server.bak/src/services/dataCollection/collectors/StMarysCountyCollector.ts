import axios from 'axios';
import path from 'path';
import fs from 'fs';
import { DataCollector, DataSource, CollectionResult, RawPropertyData } from '../types';

/**
 * Simple logger for demonstration - in production use dedicated logger module
 */
const logger = {
  info: (message: string) => console.info(`[INFO] ${message}`),
  error: (message: string) => console.error(`[ERROR] ${message}`),
  warn: (message: string) => console.warn(`[WARN] ${message}`),
  debug: (message: string) => console.debug(`[DEBUG] ${message}`)
};

/**
 * Collector for St. Mary's County, Maryland property tax records
 */
export class StMarysCountyCollector implements DataCollector {
  private baseUrl: string;
  private outputDir: string;
  private available: boolean = false;

  constructor(outputDir: string = path.join(process.cwd(), 'data', 'raw')) {
    this.baseUrl = 'https://stmarysmd.gov/treasurer/realproperty/';
    this.outputDir = outputDir;
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Get the type of this collector
   */
  getType(): string {
    return 'st-marys-county-md';
  }

  /**
   * Initialize the collector
   */
  async initialize(): Promise<void> {
    try {
      // Verify accessibility of the data source
      const response = await axios.get(this.baseUrl);
      if (response.status === 200) {
        this.available = true;
        logger.info('StMarysCountyCollector initialized successfully');
      } else {
        this.available = false;
        logger.error('StMarysCountyCollector initialization failed: Site not accessible');
      }
    } catch (error) {
      this.available = false;
      logger.error(`StMarysCountyCollector initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Check if the collector is available
   */
  isAvailable(): boolean {
    return this.available;
  }

  /**
   * Execute data collection
   * @param source Data source configuration
   */
  async collect(source: DataSource): Promise<CollectionResult> {
    if (!this.isAvailable()) {
      return {
        success: false,
        message: 'Collector is not available. Initialize first.',
        timestamp: new Date(),
        sourceId: source.id
      };
    }

    try {
      // For the PoC, we'll collect a sample of properties from a specific area
      const sampleProperties = await this.fetchSampleProperties(source);
      
      // Save raw data to file
      const outputFilePath = this.saveRawData(sampleProperties, source.id);
      
      return {
        success: true,
        message: `Successfully collected ${sampleProperties.length} properties from St. Mary's County`,
        data: sampleProperties.map(p => p.parcelId || p.accountNumber || ''),
        timestamp: new Date(),
        sourceId: source.id,
        metadata: {
          rawDataPath: outputFilePath,
          totalRecords: sampleProperties.length
        }
      };
    } catch (error) {
      logger.error(`Collection failed for source ${source.id}: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        message: `Collection failed: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date(),
        sourceId: source.id
      };
    }
  }

  /**
   * Fetch sample properties from St. Mary's County
   * For demonstration only - in production, this would query the actual county website
   */
  private async fetchSampleProperties(source: DataSource): Promise<RawPropertyData[]> {
    // For PoC, generate simulated properties
    // In a real implementation, this would scrape the county website
    const sampleProperties: RawPropertyData[] = [];
    
    // Simulate fetching 10 properties
    for (let i = 1; i <= 10; i++) {
      const propertyData: RawPropertyData = {
        accountNumber: `STM${100000 + i}`,
        ownerName: `Sample Owner ${i}`,
        propertyLocation: `${1000 + i} Main Street, Leonardtown, MD 20650`,
        landValue: 100000 + (i * 25000),
        improvementValue: 150000 + (i * 30000),
        totalValue: 250000 + (i * 55000),
        taxYear: 2023,
        taxAmount: 2500 + (i * 550),
        taxStatus: 'Paid',
        zoning: i % 3 === 0 ? 'Commercial' : 'Residential',
        acreage: 0.5 + (i * 0.2),
        source: {
          id: source.id,
          name: source.name,
          type: source.type
        },
        lastUpdated: new Date()
      };
      
      sampleProperties.push(propertyData);
    }
    
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return sampleProperties;
  }

  /**
   * Save raw data to file
   */
  private saveRawData(data: RawPropertyData[], sourceId: string): string {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `st-marys-county_${sourceId}_${timestamp}.json`;
    const outputPath = path.join(this.outputDir, filename);
    
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    logger.info(`Raw data saved to ${outputPath}`);
    
    return outputPath;
  }
} 