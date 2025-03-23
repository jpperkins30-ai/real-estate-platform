import { Document } from 'mongoose';

/**
 * Base interface for all documents
 */
export interface BaseDocument extends Document {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Property interface based on the actual implemented model
 */
export interface PropertyDocument extends BaseDocument {
  propertyAddress: string;
  city?: string;
  state: string;
  county: string;
  zipCode?: string;
  propertyType: string;
  parcelId?: string;
  ownerName?: string;
  taxAccountNumber?: string;
  legalDescription?: string;
  saleInfo?: {
    saleDate?: Date;
    saleAmount?: number;
    saleType?: 'Tax Lien' | 'Deed' | 'Conventional';
  };
}

/**
 * User interface based on the actual implemented model
 */
export interface UserDocument extends BaseDocument {
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin';
}

/**
 * Property filter type for search queries
 */
export interface PropertyFilter {
  state?: string;
  county?: string;
  propertyType?: string;
  propertyAddress?: string | RegExp;
  ownerName?: string | RegExp;
  parcelId?: string;
  'saleInfo.saleType'?: string;
  'saleInfo.saleAmount'?: {
    $gte?: number;
    $lte?: number;
  };
}

/**
 * Sort options for property queries
 */
export interface PropertySort {
  propertyAddress?: 1 | -1;
  state?: 1 | -1;
  county?: 1 | -1;
  'saleInfo.saleAmount'?: 1 | -1;
  updatedAt?: 1 | -1;
  createdAt?: 1 | -1;
}

/**
 * Raw property data from external sources
 */
export interface RawPropertyData {
  [key: string]: unknown;
}

/**
 * Type for property statistics
 */
export interface PropertyStatistics {
  state: string;
  county: string;
  count: number;
  avgPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  propertyTypes: string[];
} 