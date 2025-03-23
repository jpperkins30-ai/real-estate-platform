import axios from 'axios';
import cheerio from 'cheerio';
import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs/promises';
import path from 'path';
import { CollectorDefinition, DataSource, CollectionResult } from '../services/dataCollection';
import { logger } from '../utils/logger';
import { Property } from '../models/Property';
import mongoose from 'mongoose';

/**
 * Collector implementation for St. Mary's County, Maryland tax sale properties.
 * This collector fetches data from the county's tax sale website and SDAT property records.
 */
export class StMarysCountyCollector implements CollectorDefinition {
  id: string = 'stmarys-county-collector';
  name: string = 'St. Mary\'s County Tax Sale Collector';
  description: string = 'Collects tax sale property data from St. Mary\'s County, Maryland';
  supportedSourceTypes: string[] = ['county-website'];
  
  // Rate limiting properties
  private lastRequestTime: number = 0;
  private requestQueue: Promise<any> = Promise.resolve();
  private rateLimitWindow: number = 60000; // 60 seconds in milliseconds
  private maxRequestsPerWindow: number = 20; // Max 20 requests per minute
  private requestsInCurrentWindow: number = 0;
  private windowStartTime: number = Date.now();

  /**
   * Main execution method for the collector
   * @param source The data source configuration
   * @returns A collection result with success/failure information
   */
  async execute(source: DataSource): Promise<CollectionResult> {
    try {
      logger.info(`Starting data collection for ${source.name}`);
      
      // Step 1: Fetch the tax sale webpage
      const htmlContent = await this.rateLimitedRequest(source.url);
      
      // Step 2: Extract table data from the HTML
      const tableData = this.extractTableData(htmlContent);
      
      if (tableData.length === 0) {
        return {
          sourceId: source.id,
          timestamp: new Date(),
          success: false,
          message: 'No data found in the table',
        };
      }
      
      // Step 3: Create folder structure for storage
      const folderPath = await this.createFolderStructure(
        source.metadata.basePath || 'data',
        source.region.state,
        source.region.county || '',
        source.metadata.year || new Date().getFullYear().toString()
      );
      
      // Step 4: Save to Excel and JSON
      const baseFilename = this.generateBaseFilename(
        source.region.state,
        source.region.county || '',
        source.metadata.year || new Date().getFullYear().toString(),
        source.metadata.version || '1.0'
      );
      
      // Step 5: Save the raw data to files
      const excelFilepath = path.join(folderPath, `${baseFilename}.xlsx`);
      const jsonFilepath = path.join(folderPath, `${baseFilename}.json`);
      
      // Step 6: Create CSV for Excel compatibility (we'll use xlsx in production)
      await this.saveToCSV(tableData, path.join(folderPath, `${baseFilename}.csv`));
      
      // Step 7: Save as JSON
      await this.saveToJSON(tableData, jsonFilepath);
      
      // Step 8: Enrich each property with SDAT data
      const enrichedData = await this.enrichWithSDATData(tableData);
      
      // Step 9: Save to MongoDB
      const savedProperties = await this.saveToMongoDB(enrichedData, source);
      
      // Step 10: Prepare and return the result
      return {
        sourceId: source.id,
        timestamp: new Date(),
        success: true,
        message: `Successfully collected ${tableData.length} properties`,
        data: savedProperties,
        rawDataPath: jsonFilepath
      };
    } catch (error) {
      logger.error('Error executing St. Mary\'s County collector', error);
      return {
        sourceId: source.id,
        timestamp: new Date(),
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Enhanced rate-limited request method with queue and window tracking
   * @param url The URL to fetch
   * @returns The response data
   */
  private async rateLimitedRequest(url: string): Promise<string> {
    // Create a new promise that will be resolved when it's safe to make the request
    return new Promise((resolve, reject) => {
      this.requestQueue = this.requestQueue.then(async () => {
        try {
          // Check if we need to reset the rate limit window
          const now = Date.now();
          if (now - this.windowStartTime > this.rateLimitWindow) {
            this.windowStartTime = now;
            this.requestsInCurrentWindow = 0;
          }
          
          // Check if we've hit the rate limit
          if (this.requestsInCurrentWindow >= this.maxRequestsPerWindow) {
            // Calculate time until window resets
            const timeUntilReset = this.rateLimitWindow - (now - this.windowStartTime);
            logger.info(`Rate limit reached. Waiting ${timeUntilReset}ms before next request.`);
            await new Promise(r => setTimeout(r, timeUntilReset));
            
            // Reset window after waiting
            this.windowStartTime = Date.now();
            this.requestsInCurrentWindow = 0;
          }
          
          // Calculate delay since last request to maintain minimum spacing
          const timeSinceLastRequest = now - this.lastRequestTime;
          const minTimeBetweenRequests = this.rateLimitWindow / this.maxRequestsPerWindow;
          
          if (timeSinceLastRequest < minTimeBetweenRequests) {
            const delay = minTimeBetweenRequests - timeSinceLastRequest;
            await new Promise(r => setTimeout(r, delay));
          }
          
          // Make the request
          logger.debug(`Making rate-limited request to: ${url}`);
          const response = await axios.get(url);
          
          // Update rate limiting state
          this.lastRequestTime = Date.now();
          this.requestsInCurrentWindow++;
          
          resolve(response.data);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  // ... rest of the existing methods

  /**
   * Enriches property data with additional details from SDAT
   * @param properties Array of property data objects
   * @returns Array of enriched property objects
   */
  private async enrichWithSDATData(properties: any[]): Promise<any[]> {
    const enrichedProperties = [];
    
    for (const property of properties) {
      let retries = 3; // Maximum 3 retry attempts
      let success = false;
      
      while (retries > 0 && !success) {
        try {
          // Extract the tax account number from property data
          const taxAccountNumber = property['Tax Acct#'] || property['Account Number'] || property['Tax Account'];
          
          if (!taxAccountNumber) {
            logger.warn(`No tax account number found for property: ${JSON.stringify(property)}`);
            enrichedProperties.push(property);
            success = true;
            break;
          }
          
          // Extract the last 6 digits for the SDAT URL
          const accountNumber = taxAccountNumber.slice(-6);
          
          // Construct the SDAT URL
          // Format: https://sdat.dat.maryland.gov/RealProperty/Pages/viewdetails.aspx?County=19&SearchType=ACCT&District=08&AccountNumber=012083
          const county = '19'; // St. Mary's County code
          const district = taxAccountNumber.substring(0, 2);
          
          const sdatUrl = `https://sdat.dat.maryland.gov/RealProperty/Pages/viewdetails.aspx?County=${county}&SearchType=ACCT&District=${district}&AccountNumber=${accountNumber}`;
          
          // Fetch the SDAT page with rate limiting
          logger.info(`Fetching SDAT data for account number: ${taxAccountNumber} from URL: ${sdatUrl}`);
          const sdatHtml = await this.rateLimitedRequest(sdatUrl);
          
          // Parse the SDAT data
          const sdatData = this.extractSDATData(sdatHtml);
          
          // Merge the original property data with the SDAT data
          const enrichedProperty = { ...property, ...sdatData };
          enrichedProperties.push(enrichedProperty);
          
          success = true;
        } catch (error) {
          retries--;
          if (retries > 0) {
            const waitTime = (4 - retries) * 2000; // Exponential backoff: 2s, 4s, 6s
            logger.warn(`Error enriching property with SDAT data, retrying in ${waitTime/1000}s... (${retries} attempts left): ${error}`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          } else {
            logger.error(`Failed to enrich property with SDAT data after 3 attempts: ${error}`);
            // Add the original property without enrichment if all retries fail
            enrichedProperties.push(property);
          }
        }
      }
    }
    
    logger.info(`Enriched ${enrichedProperties.length} properties with SDAT data`);
    return enrichedProperties;
  }

  /**
   * Standardizes property data to match the MongoDB schema
   * @param propertyData Raw property data
   * @param source Data source information
   * @returns Standardized property object
   */
  private async standardizePropertyData(propertyData: any, source: DataSource): Promise<any> {
    // Extract basic property information
    const taxAccountNumber = propertyData['Tax Acct#'] || propertyData['Account Number'] || propertyData['Tax Account'];
    const ownerName = propertyData['Owner'] || propertyData['Owner Name'] || propertyData.sdatOwnerName || '';
    const propertyAddress = propertyData['Address'] || propertyData['Property Address'] || propertyData.sdatPremisesAddress || '';
    
    // Extract location information
    let city = '';
    let zipCode = '';
    
    // Try to parse city and zip from address
    const addressMatch = propertyAddress.match(/([^,]+),\s*([^,]+),\s*MD\s*(\d{5})/i);
    if (addressMatch) {
      city = addressMatch[2].trim();
      zipCode = addressMatch[3].trim();
    }
    
    // Process sale information
    const saleAmount = this.extractCurrency(propertyData['Amount Due'] || propertyData['Sale Amount'] || '0');
    
    // Get geocoding information if we have a valid address
    let coordinates = [0, 0];
    if (propertyAddress) {
      try {
        const geocodeResult = await this.geocodeProperty(propertyAddress, city || source.region.county, source.region.state);
        if (geocodeResult) {
          coordinates = [geocodeResult.longitude, geocodeResult.latitude];
        }
      } catch (error) {
        logger.warn(`Geocoding failed for address: ${propertyAddress}`, error);
      }
    }
    
    // Create standardized property object
    return {
      parcelId: taxAccountNumber,
      taxAccountNumber: taxAccountNumber,
      ownerName: ownerName,
      propertyAddress: propertyAddress,
      city: city,
      state: source.region.state,
      county: source.region.county,
      zipCode: zipCode,
      propertyType: this.determinePropertyType(propertyData),
      propertyDetails: {
        landArea: this.extractAreaValue(propertyData.sdatLandArea || ''),
        landAreaUnit: this.extractAreaUnit(propertyData.sdatLandArea || ''),
        yearBuilt: propertyData.sdatYearBuilt ? parseInt(propertyData.sdatYearBuilt.trim()) : null,
        zoning: propertyData.sdatZoning || ''
      },
      taxInfo: {
        assessedValue: propertyData.sdatTotalValue || null,
        landValue: propertyData.sdatLandValue || null,
        improvementValue: propertyData.sdatImprovementValue || null,
        taxYear: new Date().getFullYear(),
        taxStatus: this.determineTaxStatus(propertyData),
        taxDue: saleAmount
      },
      saleInfo: {
        saleType: 'Tax Lien',
        saleStatus: 'Pending',
        saleAmount: saleAmount
      },
      location: {
        coordinates: coordinates,
        latitude: coordinates[1],
        longitude: coordinates[0]
      },
      metadata: {
        rawData: propertyData,
        lastUpdated: new Date()
      },
      sourceId: new mongoose.Types.ObjectId(source.id),
      lastUpdated: new Date(),
      createdAt: new Date()
    };
  }

  /**
   * Geocodes a property address to get latitude and longitude
   * @param address The street address
   * @param city The city
   * @param state The state
   * @returns Coordinates or null if geocoding fails
   */
  private async geocodeProperty(address: string, city: string, state: string): Promise<{latitude: number, longitude: number} | null> {
    try {
      // Check if we're using a real geocoding service
      if (process.env.USE_MOCK_GEOCODING === 'true') {
        // Return mock geocoding data for development/testing
        // For St. Mary's County, return a point within the county
        return {
          latitude: 38.1968 + (Math.random() * 0.4 - 0.2), // Random point near St. Mary's County
          longitude: -76.5282 + (Math.random() * 0.4 - 0.2)
        };
      }
      
      // Use real geocoding service
      // This example uses a hypothetical geocoding service
      // In production, use Google Maps, Mapbox, or another geocoding provider
      const apiKey = process.env.GEOCODING_API_KEY;
      if (!apiKey) {
        logger.warn('No geocoding API key found, using fallback coordinates');
        return {
          latitude: 38.1968,
          longitude: -76.5282
        };
      }
      
      // Format the full address
      const fullAddress = `${address}, ${city}, ${state}`;
      
      // Rate limit geocoding requests
      await this.rateLimitedRequest(`https://api.geocoding-service.com/geocode?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`);
      
      // Parse the response (in a real implementation)
      // For this example, we'll return mock data
      return {
        latitude: 38.1968,
        longitude: -76.5282
      };
    } catch (error) {
      logger.error('Geocoding error:', error);
      return null;
    }
  }

  // ... rest of the existing methods
} 