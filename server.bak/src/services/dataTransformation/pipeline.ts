// src/services/dataTransformation/pipeline.ts

import { logger } from '../../utils/logger';
import { Property } from '../../models/Property';
import { geocodeAddress, GeocodingResult } from './geocoding';
import { fuzzyMatcher } from './fuzzyMatching';
import _ from 'lodash';
import { RawPropertyData, StandardizedPropertyData } from '../dataCollection/types';

/**
 * Interface for property data from various sources
 */
export interface RawPropertyData {
  [key: string]: any;
  source?: string;
}

/**
 * Interface for standardized property data
 */
export interface StandardizedPropertyData {
  parcelId: string;
  taxAccountNumber?: string;
  ownerName?: string;
  propertyAddress?: string;
  city?: string;
  state: string;
  county: string;
  zipCode?: string;
  propertyType?: string;
  propertyDetails?: {
    landArea?: number;
    landAreaUnit?: string;
    buildingArea?: number;
    buildingAreaUnit?: string;
    yearBuilt?: number;
    zoning?: string;
    [key: string]: any;
  };
  taxInfo?: {
    assessedValue?: number;
    landValue?: number;
    improvementValue?: number;
    taxYear?: number;
    taxStatus?: string;
    taxDue?: number;
    [key: string]: any;
  };
  saleInfo?: {
    saleType?: string;
    saleStatus?: string;
    saleAmount?: number;
    [key: string]: any;
  };
  location?: {
    latitude?: number;
    longitude?: number;
    coordinates?: [number, number];
    formattedAddress?: string;
    [key: string]: any;
  };
  metadata?: {
    rawData?: any;
    processingNotes?: string[];
    sourceId?: string;
    lastUpdated?: Date;
    validationResults?: Array<{ rule: string; valid: boolean; message?: string }>;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Interface for data transformation steps
 */
export interface TransformationStep {
  name: string;
  transform: (data: RawPropertyData | StandardizedPropertyData) => Promise<StandardizedPropertyData>;
}

/**
 * Interface for data validation rules
 */
export interface ValidationRule {
  name: string;
  validate: (data: StandardizedPropertyData) => Promise<{ valid: boolean; message?: string }>;
}

/**
 * Data Transformation Pipeline
 * Handles standardization of property data from various sources
 */
export class TransformationPipeline {
  private transformationSteps: TransformationStep[] = [];
  private validationRules: ValidationRule[] = [];
  private sourceMap: Map<string, Function> = new Map();

  constructor() {
    // Register default transformation steps
    this.registerTransformationStep({
      name: 'Initial Standardization',
      transform: this.initialStandardization.bind(this)
    });

    this.registerTransformationStep({
      name: 'Address Normalization',
      transform: this.normalizeAddress.bind(this)
    });

    this.registerTransformationStep({
      name: 'Geocoding',
      transform: this.geocodeProperty.bind(this)
    });

    // Register default validation rules
    this.registerValidationRule({
      name: 'Required Fields',
      validate: this.validateRequiredFields.bind(this)
    });

    // Register source-specific standardization functions
    this.registerSourceStandardization('stmarys-county', this.standardizeStMarysCounty.bind(this));
  }

  /**
   * Register a transformation step
   * @param step The transformation step to register
   */
  registerTransformationStep(step: TransformationStep): void {
    this.transformationSteps.push(step);
    logger.info(`Registered transformation step: ${step.name}`);
  }

  /**
   * Register a validation rule
   * @param rule The validation rule to register
   */
  registerValidationRule(rule: ValidationRule): void {
    this.validationRules.push(rule);
    logger.info(`Registered validation rule: ${rule.name}`);
  }

  /**
   * Register a source-specific standardization function
   * @param sourceId The source identifier
   * @param standardizeFn The standardization function
   */
  registerSourceStandardization(sourceId: string, standardizeFn: Function): void {
    this.sourceMap.set(sourceId, standardizeFn);
    logger.info(`Registered source standardization for: ${sourceId}`);
  }

  /**
   * Process a raw property data object through the transformation pipeline
   * @param data Raw property data
   * @param sourceType Optional source type to use specific transformations
   * @returns Standardized property data
   */
  async process(data: RawPropertyData, sourceType?: string): Promise<StandardizedPropertyData> {
    try {
      // Step 1: Initial standardization
      const standardized = this.initialStandardization(data, sourceType);
      
      // Step 2: Address normalization and parsing
      const withNormalizedAddress = this.normalizeAddress(standardized);
      
      // Step 3: Geocode the property if address is available
      const geocoded = await this.geocodeProperty(withNormalizedAddress);
      
      // Step 4: Derive additional fields
      const enriched = this.enrichData(geocoded);
      
      // Step 5: Validate the data
      const validated = this.validateData(enriched);
      
      return validated;
    } catch (error) {
      console.error(`Error in transformation pipeline: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Transformation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Initial standardization of property data
   * Maps raw fields to standardized format
   */
  private initialStandardization(
    data: RawPropertyData,
    sourceType?: string
  ): StandardizedPropertyData {
    // Check if data is already standardized
    if (this.isStandardized(data)) {
      return data as StandardizedPropertyData;
    }
    
    // Basic standardized property object
    const standardized: StandardizedPropertyData = {
      parcelId: '',
      propertyAddress: '',
      city: '',
      state: '',
      county: '',
      zipCode: '',
      metadata: {
        sourceId: data.source?.id || 'unknown',
        lastUpdated: new Date(),
        rawData: data
      }
    };
    
    // Apply source-specific transformations
    if (sourceType === 'st-marys-county-md') {
      return this.standardizeStMarysCounty(data, standardized);
    }
    
    // Generic transformation for unknown sources
    return this.standardizeGeneric(data, standardized);
  }
  
  /**
   * Check if data is already in standardized format
   */
  private isStandardized(data: RawPropertyData | StandardizedPropertyData): data is StandardizedPropertyData {
    // Check if the object has the required fields of StandardizedPropertyData
    return (
      'parcelId' in data &&
      'propertyAddress' in data &&
      'city' in data &&
      'state' in data &&
      'county' in data
    );
  }
  
  /**
   * Standardize data from St. Mary's County
   */
  private standardizeStMarysCounty(
    rawData: RawPropertyData,
    standardized: StandardizedPropertyData
  ): StandardizedPropertyData {
    // Map St. Mary's County specific fields
    standardized.parcelId = rawData.accountNumber || '';
    standardized.propertyAddress = rawData.propertyLocation || '';
    standardized.state = 'MD';
    standardized.county = "St. Mary's";
    
    // Parse property location to extract city and zip
    if (standardized.propertyAddress) {
      const addressParts = standardized.propertyAddress.split(',');
      if (addressParts.length >= 2) {
        // Extract city and state/zip if available
        const cityStateZip = addressParts[addressParts.length - 1].trim().split(' ');
        if (cityStateZip.length >= 3) {
          standardized.city = addressParts[addressParts.length - 2].trim();
          standardized.zipCode = cityStateZip[cityStateZip.length - 1];
        }
      }
    }
    
    // Map additional fields
    standardized.ownerName = rawData.ownerName;
    standardized.propertyType = this.determinePropertyType(rawData.zoning);
    
    standardized.taxInfo = {
      taxAmount: rawData.taxAmount,
      taxYear: rawData.taxYear,
      taxStatus: rawData.taxStatus,
    };
    
    standardized.propertyDetails = {
      landArea: rawData.acreage,
      zoning: rawData.zoning,
    };
    
    if (rawData.landValue || rawData.improvementValue || rawData.totalValue) {
      standardized.saleInfo = {
        saleAmount: rawData.totalValue || 0,
        saleType: 'Assessment'
      };
    }
    
    return standardized;
  }
  
  /**
   * Generic standardization for unknown data sources
   */
  private standardizeGeneric(
    rawData: RawPropertyData,
    standardized: StandardizedPropertyData
  ): StandardizedPropertyData {
    // Try common field names for generic data sources
    standardized.parcelId = 
      rawData.parcelId || 
      rawData.parcelNumber || 
      rawData.accountNumber || 
      rawData.apn || 
      rawData.pin || 
      '';
    
    standardized.propertyAddress = 
      rawData.propertyAddress || 
      rawData.address || 
      rawData.situs || 
      rawData.location || 
      '';
    
    standardized.city = 
      rawData.city || 
      rawData.municipality || 
      '';
    
    standardized.state = 
      rawData.state || 
      rawData.stateCode || 
      '';
    
    standardized.county = 
      rawData.county || 
      '';
    
    standardized.zipCode = 
      rawData.zipCode || 
      rawData.zip || 
      rawData.postalCode || 
      '';
    
    // Try to extract other common fields
    standardized.ownerName = 
      rawData.ownerName || 
      rawData.owner || 
      '';
    
    // Extract property type if available
    standardized.propertyType = 
      rawData.propertyType || 
      rawData.type || 
      this.determinePropertyType(rawData.zoning || rawData.use);
    
    // Extract sale information if available
    if (rawData.saleAmount || rawData.price || rawData.value) {
      standardized.saleInfo = {
        saleAmount: parseFloat(String(rawData.saleAmount || rawData.price || rawData.value || 0)),
        saleDate: rawData.saleDate instanceof Date ? rawData.saleDate : undefined,
        saleType: rawData.saleType || ''
      };
    }
    
    // Extract tax information if available
    if (rawData.taxAmount || rawData.taxYear) {
      standardized.taxInfo = {
        taxAmount: parseFloat(String(rawData.taxAmount || 0)),
        taxYear: parseInt(String(rawData.taxYear || new Date().getFullYear()), 10),
        taxStatus: rawData.taxStatus || '',
        taxAccountNumber: rawData.taxAccountNumber || ''
      };
    }
    
    // Extract property details if available
    standardized.propertyDetails = {
      landArea: parseFloat(String(rawData.landArea || rawData.acreage || rawData.sqft || 0)),
      buildingArea: parseFloat(String(rawData.buildingArea || rawData.buildingSqft || 0)),
      yearBuilt: parseInt(String(rawData.yearBuilt || 0), 10),
      bedrooms: parseInt(String(rawData.bedrooms || 0), 10),
      bathrooms: parseFloat(String(rawData.bathrooms || 0)),
      zoning: rawData.zoning || ''
    };
    
    return standardized;
  }
  
  /**
   * Determine property type from zoning or use code
   */
  private determinePropertyType(zoningOrUse?: string): string {
    if (!zoningOrUse) return 'Unknown';
    
    const lowerZoning = zoningOrUse.toLowerCase();
    
    if (lowerZoning.includes('res') || lowerZoning.includes('r-')) {
      return 'Residential';
    }
    
    if (lowerZoning.includes('com') || lowerZoning.includes('c-')) {
      return 'Commercial';
    }
    
    if (lowerZoning.includes('ind') || lowerZoning.includes('i-')) {
      return 'Industrial';
    }
    
    if (lowerZoning.includes('agr') || lowerZoning.includes('a-')) {
      return 'Agricultural';
    }
    
    if (lowerZoning.includes('mix')) {
      return 'Mixed Use';
    }
    
    return 'Other';
  }
  
  /**
   * Normalize property address
   */
  private normalizeAddress(data: StandardizedPropertyData): StandardizedPropertyData {
    // Skip if no address is provided
    if (!data.propertyAddress) {
      return data;
    }
    
    // Make a copy to avoid modifying the original
    const result = { ...data };
    
    // Convert to uppercase for consistency
    let normalizedAddress = data.propertyAddress.trim();
    
    // Common abbreviation replacements
    const replacements: Record<string, string> = {
      'STREET': 'ST',
      'AVENUE': 'AVE',
      'BOULEVARD': 'BLVD',
      'DRIVE': 'DR',
      'ROAD': 'RD',
      'LANE': 'LN',
      'CIRCLE': 'CIR',
      'COURT': 'CT',
      'PLACE': 'PL',
      'HIGHWAY': 'HWY',
      'PARKWAY': 'PKWY',
      'TERRACE': 'TER',
      'NORTH': 'N',
      'SOUTH': 'S',
      'EAST': 'E',
      'WEST': 'W',
      'NORTHEAST': 'NE',
      'NORTHWEST': 'NW',
      'SOUTHEAST': 'SE',
      'SOUTHWEST': 'SW',
      'APARTMENT': 'APT',
      'SUITE': 'STE',
      'UNIT': 'UNIT'
    };
    
    // Replace full words with abbreviations
    for (const [full, abbr] of Object.entries(replacements)) {
      const regex = new RegExp(`\\b${full}\\b`, 'gi');
      normalizedAddress = normalizedAddress.replace(regex, abbr);
    }
    
    // Set normalized address
    result.propertyAddress = normalizedAddress;
    
    return result;
  }
  
  /**
   * Geocode property based on address
   */
  private async geocodeProperty(data: StandardizedPropertyData): Promise<StandardizedPropertyData> {
    // Skip if no address is provided
    if (!data.propertyAddress) {
      return data;
    }
    
    // Make a copy to avoid modifying the original
    const result = { ...data };
    
    try {
      // Construct full address for geocoding
      let addressForGeocoding = data.propertyAddress;
      if (data.city) addressForGeocoding += `, ${data.city}`;
      if (data.state) addressForGeocoding += `, ${data.state}`;
      if (data.zipCode) addressForGeocoding += ` ${data.zipCode}`;
      
      // Geocode the address
      const geocodeResult = await geocodeAddress(addressForGeocoding);
      
      // Set coordinates and formatted address if geocoding was successful
      if (geocodeResult) {
        result.location = {
          coordinates: [geocodeResult.longitude, geocodeResult.latitude],
          formattedAddress: geocodeResult.formattedAddress
        };
      }
    } catch (error) {
      console.warn(`Geocoding failed for address "${data.propertyAddress}": ${error instanceof Error ? error.message : String(error)}`);
    }
    
    return result;
  }
  
  /**
   * Enrich data with derived fields
   */
  private enrichData(data: StandardizedPropertyData): StandardizedPropertyData {
    // Make a copy to avoid modifying the original
    const result = { ...data };
    
    // Add timestamp for when this record was processed
    if (result.metadata) {
      result.metadata.lastUpdated = new Date();
    }
    
    return result;
  }
  
  /**
   * Validate transformed data
   * Ensures required fields are present and valid
   */
  private validateData(data: StandardizedPropertyData): StandardizedPropertyData {
    // Required fields
    const requiredFields = ['parcelId', 'propertyAddress', 'state'];
    
    // Check required fields
    for (const field of requiredFields) {
      if (!data[field as keyof StandardizedPropertyData]) {
        console.warn(`Validation: Missing required field "${field}"`);
      }
    }
    
    // Additional validations can be added here
    
    return data;
  }
  
  /**
   * Required fields validation rule
   * Ensures all required fields are present and valid
   * @param data The property data to validate
   * @returns Validation result
   */
  private async validateRequiredFields(data: StandardizedPropertyData): Promise<{ valid: boolean; message?: string }> {
    const requiredFields = ['parcelId', 'state', 'county'];
    const missingFields = [];
    
    for (const field of requiredFields) {
      if (!data[field]) {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      return {
        valid: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      };
    }
    
    return { valid: true };
  }
} 