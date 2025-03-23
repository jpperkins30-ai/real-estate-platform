/**
 * Types and interfaces for the data collection framework
 */

import { Document } from 'mongoose';

/**
 * Interface for data source configuration
 */
export interface DataSource extends Document {
  id: string;
  name: string;
  type: string;
  url: string;
  region: {
    state: string;
    county: string;
  };
  collectorType: string;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'manual';
    dayOfWeek?: number;
    dayOfMonth?: number;
  };
  metadata: Record<string, any>;
  status: 'active' | 'inactive' | 'error';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for collection execution results
 */
export interface CollectionResult {
  success: boolean;
  message: string;
  data?: string[]; // Array of property IDs
  timestamp: Date;
  sourceId: string;
  metadata?: Record<string, any>;
}

/**
 * Interface for data collectors
 */
export interface DataCollector {
  /**
   * Get the collector type identifier
   */
  getType(): string;

  /**
   * Initialize the collector
   */
  initialize(): Promise<void>;

  /**
   * Execute data collection for a specific source
   * @param source The data source to collect from
   * @returns Collection result with status and data
   */
  collect(source: DataSource): Promise<CollectionResult>;

  /**
   * Check if the collector is available
   */
  isAvailable(): boolean;
}

/**
 * Interface for collector manager configuration
 */
export interface CollectorManagerConfig {
  rateLimitDelay: number;
  maxConcurrentCollections: number;
  logLevel: string;
}

/**
 * Standard property data fields
 */
export interface StandardizedPropertyData {
  parcelId: string;
  propertyAddress: string;
  city: string;
  state: string;
  county: string;
  zipCode: string;
  ownerName?: string;
  propertyType?: string;
  saleInfo?: {
    saleAmount: number;
    saleDate?: Date;
    saleType?: string;
  };
  taxInfo?: {
    taxAmount?: number;
    taxYear?: number;
    taxStatus?: string;
    taxAccountNumber?: string;
  };
  propertyDetails?: {
    landArea?: number;
    buildingArea?: number;
    yearBuilt?: number;
    bedrooms?: number;
    bathrooms?: number;
    zoning?: string;
  };
  location?: {
    coordinates?: [number, number]; // [longitude, latitude]
    formattedAddress?: string;
  };
  metadata?: {
    sourceId: string;
    collectionId?: string;
    rawData?: any;
    lastUpdated?: Date;
  };
}

/**
 * Raw property data before standardization
 */
export interface RawPropertyData {
  [key: string]: any;
  source?: {
    id: string;
    name?: string;
    type?: string;
  };
}

export interface CollectorDefinition {
  id: string;
  name: string;
  description: string;
  supportedSourceTypes: string[];
  execute: (source: DataSource) => Promise<CollectionResult>;
  validateSource?: (source: DataSource) => Promise<{ valid: boolean; message?: string }>;
} 