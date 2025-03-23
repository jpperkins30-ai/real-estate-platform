import { Document } from 'mongoose';

/**
 * Interface defining a data source for collection
 */
export interface DataSource {
  id: string;
  name: string;
  type: 'county-website' | 'state-records' | 'tax-database' | 'api' | 'pdf';
  url: string;
  region: {
    state: string;
    county?: string;
  };
  collectorType: string;
  schedule: {
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'manual';
    dayOfWeek?: number;
    dayOfMonth?: number;
  };
  metadata?: Record<string, any>;
  lastCollected?: Date;
  status: 'active' | 'inactive' | 'error';
  errorMessage?: string;
}

/**
 * Interface for collection results
 */
export interface CollectionResult {
  sourceId: string;
  timestamp: Date;
  success: boolean;
  message?: string;
  data?: string[]; // Array of saved property IDs
  rawDataPath?: string;
}

/**
 * Interface defining a collector implementation
 */
export interface CollectorDefinition {
  id: string;
  name: string;
  description: string;
  supportedSourceTypes: string[];
  execute: (source: DataSource) => Promise<CollectionResult>;
  validateSource: (source: DataSource) => Promise<{ valid: boolean; message?: string }>;
}

/**
 * Types for raw and standardized property data
 */
export interface RawPropertyData {
  [key: string]: any;
  source?: string;
}

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
    [key: string]: any;
  };
  metadata?: {
    rawData?: any;
    processingNotes?: string[];
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Error types and classes
 */
export enum ErrorType {
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  PARSING_ERROR = 'PARSING_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  TRANSFORMATION_ERROR = 'TRANSFORMATION_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export class CollectionError extends Error {
  type: ErrorType;
  source: string;
  details?: any;
  
  constructor(message: string, source: string, type: ErrorType, details?: any) {
    super(message);
    this.name = 'CollectionError';
    this.type = type;
    this.source = source;
    this.details = details;
  }
} 