import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import { CollectionResult, DataSource, ErrorType, CollectionError } from '../../../types/collector';
import { BaseCollector } from '../BaseCollector';
import { logger } from '../../../utils/collectorLogger';
import Property from '../../../models/property.model';
import mongoose from 'mongoose';

/**
 * Collector implementation for St. Mary's County, Maryland tax sale properties
 */
export class StMarysCountyCollector extends BaseCollector {
  constructor() {
    super(
      'stmarys-county-collector',
      'St. Mary\'s County Tax Sale Collector',
      'Collects tax sale property data from St. Mary\'s County, Maryland',
      ['county-website']
    );
  }

  /**
   * Main execution method for the collector
   * @param source The data source configuration
   * @returns A collection result with success/failure information
   */
  async execute(source: DataSource): Promise<CollectionResult> {
    try {
      this.logProgress(source, 'Starting data collection');
      
      // Step 1: Fetch the tax sale webpage
      const htmlContent = await this.fetchWebpage(source.url);
      
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
      const basePath = source.metadata?.basePath || 'data';
      const folderPath = await this.createFolderStructure(
        basePath,
        source.region.state,
        source.region.county || '',
        (source.metadata?.year || new Date().getFullYear()).toString()
      );
      
      // Step 4: Generate base filename
      const baseFilename = this.generateBaseFilename(
        source.region.state,
        source.region.county || '',
        (source.metadata?.year || new Date().getFullYear()).toString(),
        source.metadata?.version || '1.0'
      );
      
      // Step 5: Save the raw data to JSON file
      const jsonFilepath = path.join(folderPath, `${baseFilename}.json`);
      await this.saveToJSON(tableData, jsonFilepath);
      
      // Step 6: Enrich each property with SDAT data (if configured)
      let enrichedData = tableData;
      if (source.metadata?.enrichWithSDAT) {
        this.logProgress(source, 'Enriching properties with SDAT data');
        enrichedData = await this.enrichWithSDATData(tableData);
      }
      
      // Step 7: Save to MongoDB
      this.logProgress(source, 'Saving properties to database');
      const savedProperties = await this.saveToMongoDB(enrichedData, source);
      
      this.logProgress(source, `Successfully collected ${tableData.length} properties`);
      
      // Step 8: Prepare and return the result
      return {
        sourceId: source.id,
        timestamp: new Date(),
        success: true,
        message: `Successfully collected ${tableData.length} properties`,
        data: savedProperties,
        rawDataPath: jsonFilepath
      };
    } catch (error) {
      this.logError(source, 'Error executing collection', error);
      return {
        sourceId: source.id,
        timestamp: new Date(),
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Override validateSource to add St. Mary's County specific validation
   * @param source The data source to validate
   * @returns Validation result with valid flag and optional message
   */
  async validateSource(source: DataSource): Promise<{ valid: boolean; message?: string }> {
    // Call the base validation first
    const baseValidation = await super.validateSource(source);
    if (!baseValidation.valid) {
      return baseValidation;
    }
    
    // St. Mary's County specific validation
    if (source.region.state !== 'MD') {
      return { valid: false, message: 'State must be MD for St. Mary\'s County collector' };
    }
    
    if (source.region.county !== 'St. Mary\'s') {
      return { valid: false, message: 'County must be St. Mary\'s for this collector' };
    }
    
    // Check if URL is accessible
    try {
      const response = await axios.head(source.url);
      if (response.status !== 200) {
        return { valid: false, message: `URL returned status ${response.status}` };
      }
    } catch (error) {
      return { 
        valid: false, 
        message: error instanceof Error ? `URL is not accessible: ${error.message}` : 'URL is not accessible'
      };
    }
    
    return { valid: true };
  }

  /**
   * Fetches the webpage content from the given URL
   * @param url The URL to fetch
   * @returns The HTML content as a string
   */
  private async fetchWebpage(url: string): Promise<string> {
    try {
      const response = await axios.get(url);
      logger.info('collection', `Successfully fetched webpage: ${url}`);
      return response.data;
    } catch (error) {
      logger.error('collection', 'Error fetching webpage', error);
      throw new CollectionError(
        `Failed to fetch webpage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'StMarysCountyCollector',
        ErrorType.CONNECTION_ERROR,
        error
      );
    }
  }

  /**
   * Extracts table data from HTML content
   * @param htmlContent The HTML content to parse
   * @returns Array of row objects with column headers as keys
   */
  private extractTableData(htmlContent: string): any[] {
    try {
      const $ = cheerio.load(htmlContent);
      const table = $('table').first();
      
      if (table.length === 0) {
        logger.error('collection', 'No table found on the page');
        return [];
      }
      
      // Extract headers
      const headers: string[] = [];
      table.find('th').each((i, el) => {
        headers.push($(el).text().trim());
      });
      
      logger.info('collection', `Extracted headers: ${headers.join(', ')}`);
      
      // Extract rows
      const rows: any[] = [];
      table.find('tr').slice(1).each((i, row) => {
        const rowData: Record<string, string> = {};
        $(row).find('td').each((j, cell) => {
          if (j < headers.length) {
            rowData[headers[j]] = $(cell).text().trim();
          }
        });
        
        if (Object.keys(rowData).length > 0) {
          rows.push(rowData);
        }
      });
      
      logger.info('collection', `Extracted ${rows.length} rows from the table`);
      return rows;
    } catch (error) {
      logger.error('collection', 'Error extracting table data', error);
      throw new CollectionError(
        `Failed to extract table data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'StMarysCountyCollector',
        ErrorType.PARSING_ERROR,
        error
      );
    }
  }

  /**
   * Creates a folder structure based on state, county, and year
   * @param basePath Base directory path
   * @param state State abbreviation
   * @param county County name
   * @param year Year of collection
   * @returns The complete folder path
   */
  private async createFolderStructure(basePath: string, state: string, county: string, year: string): Promise<string> {
    const folderPath = path.join(basePath, state, county, year);
    
    try {
      await fs.mkdir(folderPath, { recursive: true });
      logger.info('collection', `Created folder structure at: ${folderPath}`);
      return folderPath;
    } catch (error) {
      logger.error('collection', `Error creating folder structure: ${error}`);
      throw new CollectionError(
        `Failed to create folder structure: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'StMarysCountyCollector',
        ErrorType.STORAGE_ERROR,
        error
      );
    }
  }

  /**
   * Generates a base filename based on metadata
   * @param state State abbreviation
   * @param county County name
   * @param year Year of collection
   * @param version Version identifier
   * @returns The base filename without extension
   */
  private generateBaseFilename(state: string, county: string, year: string, version: string): string {
    const today = new Date();
    const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}${today.getFullYear()}`;
    return `${state}_${county}_${year}_${todayStr}_${version}`;
  }

  /**
   * Saves data to a JSON file
   * @param data Array of data objects
   * @param filepath Path to save the JSON file
   */
  private async saveToJSON(data: any[], filepath: string): Promise<void> {
    try {
      await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf8');
      logger.info('collection', `Data successfully saved to JSON file: ${filepath}`);
    } catch (error) {
      logger.error('collection', `Error saving JSON file: ${error}`);
      throw new CollectionError(
        `Failed to save JSON file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'StMarysCountyCollector',
        ErrorType.STORAGE_ERROR,
        error
      );
    }
  }

  /**
   * Enriches property data with additional details from SDAT
   * @param properties Array of property data objects
   * @returns Array of enriched property objects
   */
  private async enrichWithSDATData(properties: any[]): Promise<any[]> {
    const enrichedProperties = [];
    
    for (const property of properties) {
      try {
        // Extract the tax account number from property data
        const taxAccountNumber = property['Tax Acct#'] || property['Account Number'] || property['Tax Account'];
        
        if (!taxAccountNumber) {
          logger.warn('collection', `No tax account number found for property: ${JSON.stringify(property)}`);
          enrichedProperties.push(property);
          continue;
        }
        
        // Extract the last 6 digits for the SDAT URL
        const accountNumber = taxAccountNumber.slice(-6);
        
        // Construct the SDAT URL
        // Format: https://sdat.dat.maryland.gov/RealProperty/Pages/viewdetails.aspx?County=19&SearchType=ACCT&District=08&AccountNumber=012083
        const county = '19'; // St. Mary's County code
        const district = taxAccountNumber.substring(0, 2);
        
        const sdatUrl = `https://sdat.dat.maryland.gov/RealProperty/Pages/viewdetails.aspx?County=${county}&SearchType=ACCT&District=${district}&AccountNumber=${accountNumber}`;
        
        // Fetch the SDAT page
        logger.info('collection', `Fetching SDAT data for account number: ${taxAccountNumber} from URL: ${sdatUrl}`);
        const sdatHtml = await this.fetchWebpage(sdatUrl);
        
        // Parse the SDAT data
        const sdatData = this.extractSDATData(sdatHtml);
        
        // Merge the original property data with the SDAT data
        const enrichedProperty = { ...property, ...sdatData };
        enrichedProperties.push(enrichedProperty);
        
        // Add a small delay to avoid overloading the SDAT server
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        logger.error('collection', `Error enriching property with SDAT data: ${error}`);
        // Continue with the next property even if one fails
        enrichedProperties.push(property);
      }
    }
    
    logger.info('collection', `Enriched ${enrichedProperties.length} properties with SDAT data`);
    return enrichedProperties;
  }

  /**
   * Extracts property details from the SDAT HTML page
   * @param sdatHtml The HTML content from the SDAT website
   * @returns Object containing extracted property details
   */
  private extractSDATData(sdatHtml: string): Record<string, any> {
    try {
      const $ = cheerio.load(sdatHtml);
      const sdatData: Record<string, any> = {};
      
      // Extract general property information
      sdatData.sdatPremisesAddress = $('.SDAT_Value:contains("Premise Address")').next().text().trim();
      sdatData.sdatLegalDescription = $('.SDAT_Value:contains("Legal Description")').next().text().trim();
      
      // Extract assessment data
      sdatData.sdatLandValue = this.extractCurrency($('.SDAT_Label:contains("Land:")').siblings().text());
      sdatData.sdatImprovementValue = this.extractCurrency($('.SDAT_Label:contains("Improvements:")').siblings().text());
      sdatData.sdatTotalValue = this.extractCurrency($('.SDAT_Label:contains("Total:")').siblings().text());
      
      // Extract property details
      sdatData.sdatYearBuilt = $('.SDAT_DataRepeater:contains("Year Built")').find('.SDAT_Value').text().trim();
      sdatData.sdatLandArea = $('.SDAT_DataRepeater:contains("Land Area")').find('.SDAT_Value').text().trim();
      sdatData.sdatZoning = $('.SDAT_DataRepeater:contains("Zoning")').find('.SDAT_Value').text().trim();
      
      // Extract ownership information
      sdatData.sdatOwnerName = $('.SDAT_Value:contains("Owner Name")').next().text().trim();
      
      return sdatData;
    } catch (error) {
      logger.error('collection', 'Error extracting SDAT data', error);
      return {}; // Return empty object if parsing fails
    }
  }

  /**
   * Extracts currency value from a string
   * @param text Text containing a currency value
   * @returns Numeric value or null if no valid number found
   */
  private extractCurrency(text: string): number | null {
    const match = text.match(/\$?([\d,]+)/);
    if (match && match[1]) {
      // Remove commas and convert to number
      return parseFloat(match[1].replace(/,/g, ''));
    }
    return null;
  }

  /**
   * Saves property data to MongoDB
   * @param properties Array of property data objects
   * @param source The data source configuration
   * @returns Array of saved property IDs
   */
  private async saveToMongoDB(properties: any[], source: DataSource): Promise<string[]> {
    const savedIds: string[] = [];
    
    for (const propertyData of properties) {
      try {
        // Standardize the property data to match our schema
        const standardizedProperty = this.standardizePropertyData(propertyData, source);
        
        // Check if the property already exists in the database
        let property = await Property.findOne({ 
          parcelId: standardizedProperty.parcelId 
        });
        
        if (property) {
          // Update existing property
          for (const [key, value] of Object.entries(standardizedProperty)) {
            property.set(key, value);
          }
          property.set('metadata.lastUpdated', new Date());
          await property.save();
          logger.info('collection', `Updated property: ${property.parcelId}`);
        } else {
          // Create new property
          property = await Property.create({
            ...standardizedProperty,
            metadata: {
              ...standardizedProperty.metadata,
              sourceId: new mongoose.Types.ObjectId(source.id),
              collectionDate: new Date()
            }
          });
          logger.info('collection', `Created new property: ${property.parcelId}`);
        }
        
        savedIds.push(property._id.toString());
      } catch (error) {
        logger.error('collection', `Error saving property to MongoDB: ${error}`);
        // Continue with the next property even if one fails
      }
    }
    
    logger.info('collection', `Saved ${savedIds.length} properties to MongoDB`);
    return savedIds;
  }

  /**
   * Standardizes property data to match the MongoDB schema
   * @param propertyData Raw property data
   * @param source Data source information
   * @returns Standardized property object
   */
  private standardizePropertyData(propertyData: any, source: DataSource): any {
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
      legalDescription: propertyData.sdatLegalDescription || '',
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
      metadata: {
        rawData: propertyData,
        processingNotes: ['Collected from St. Mary\'s County tax sale data']
      }
    };
  }

  /**
   * Determines the property type based on available data
   * @param propertyData Raw property data
   * @returns Property type string
   */
  private determinePropertyType(propertyData: any): string {
    const description = (
      propertyData['Description'] || 
      propertyData['Property Description'] || 
      propertyData.sdatLegalDescription || 
      ''
    ).toLowerCase();
    
    if (description.includes('vacant') || description.includes('land')) {
      return 'Vacant Land';
    } else if (description.includes('commercial')) {
      return 'Commercial';
    } else if (description.includes('residential')) {
      return 'Residential';
    } else if (description.includes('industrial')) {
      return 'Industrial';
    } else if (description.includes('agricultural')) {
      return 'Agricultural';
    }
    
    return 'Unknown';
  }

  /**
   * Determines tax status based on available data
   * @param propertyData Raw property data
   * @returns Tax status string
   */
  private determineTaxStatus(propertyData: any): string {
    const status = (propertyData['Status'] || '').toLowerCase();
    
    if (status.includes('delinquent')) {
      return 'Delinquent';
    } else if (status.includes('foreclosure')) {
      return 'Foreclosure';
    } else if (propertyData['Amount Due']) {
      return 'Delinquent';
    }
    
    return 'Unknown';
  }

  /**
   * Extracts numeric value from area string
   * @param areaString Area string (e.g., "1.5 ACRES")
   * @returns Numeric value or null
   */
  private extractAreaValue(areaString: string): number | null {
    const match = areaString.match(/([\d.,]+)/);
    return match ? parseFloat(match[1].replace(',', '')) : null;
  }

  /**
   * Extracts unit from area string
   * @param areaString Area string (e.g., "1.5 ACRES")
   * @returns Unit string (e.g., "ACRES")
   */
  private extractAreaUnit(areaString: string): string {
    const match = areaString.match(/[\d.,]+\s+([A-Za-z]+)/);
    return match ? match[1].toUpperCase() : 'SQFT';
  }
} 