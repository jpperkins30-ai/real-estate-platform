/**
 * Property related types for the application
 */

export enum PropertyStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  SOLD = 'sold',
  FORECLOSURE = 'foreclosure',
  OFF_MARKET = 'off_market'
}

export enum PropertyType {
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  INDUSTRIAL = 'industrial',
  LAND = 'land',
  MULTI_FAMILY = 'multi_family'
}

export interface PropertyLocation {
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  address: {
    street: string;
    city: string;
    state: string;
    county: string;
    zipCode: string;
  };
}

export interface PropertyFeatures {
  type: PropertyType;
  condition: string;
  yearBuilt?: number;
  squareFeet?: number;
  lotSize?: number;
  bedrooms?: number;
  bathrooms?: number;
}

export interface PropertyTaxStatus {
  assessedValue?: number;
  marketValue?: number;
  taxRate?: number;
  annualTaxAmount?: number;
  taxLienAmount?: number;
  taxLienStatus?: string;
}

export interface PropertyImage {
  url: string;
  caption?: string;
  isPrimary?: boolean;
}

export interface PropertyDocument {
  type: string;
  url: string;
  name: string;
  uploadDate: Date;
}

export interface PropertyFilters {
  stateId?: string;
  countyId?: string;
  propertyType?: PropertyType;
  taxStatus?: string;
  minValue?: number;
  maxValue?: number;
  status?: PropertyStatus;
  searchQuery?: string;
  limit?: number;
  offset?: number;
} 