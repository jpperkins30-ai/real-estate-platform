/**
 * Property-related type definitions
 */

export interface PropertyFeatures {
  address: string;
  propertyType: string;  // residential, commercial, industrial, etc.
  squareFeet: number;
  lotSize?: number;      // in square feet
  bedrooms?: number;
  bathrooms?: number;
  yearBuilt?: number;
  stories?: number;
  amenities?: string[];
  condition?: string;    // excellent, good, fair, poor
  location?: {
    latitude: number;
    longitude: number;
    neighborhood?: string;
    city: string;
    county: string;
    state: string;
    zipCode: string;
  };
}

export interface ComparableProperty {
  address: string;
  propertyType: string;
  squareFeet: number;
  lotSize?: number;
  bedrooms?: number;
  bathrooms?: number;
  yearBuilt?: number;
  saleDate: Date;
  salePrice: number;
  pricePerSquareFoot: number;
  distance?: number;     // distance from subject property in miles
  features?: string[];
}

export interface ValuationResult {
  estimatedValue: number;
  valuationRange: {
    low: number;
    high: number;
  };
  confidenceScore: number;  // 0-1 scale
  comparables: ComparableProperty[];
  adjustments: {
    type: string;
    amount: number;
    description: string;
  }[];
  methodology: string;
  valuationDate: Date;
}

export interface PropertyListing {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  pricePerSqFt: number;
  squareFeet: number;
  bedrooms: number;
  bathrooms: number;
  propertyType: string;
  yearBuilt: number;
  lotSize: number;
  description: string;
  features: string[];
  images: string[];
  status: 'active' | 'pending' | 'sold' | 'off-market';
  listedDate: Date;
  daysOnMarket: number;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface PropertySearch {
  location?: {
    city?: string;
    state?: string;
    zipCode?: string;
    radius?: number;  // in miles
  };
  priceRange?: {
    min?: number;
    max?: number;
  };
  sizeRange?: {
    min?: number;
    max?: number;
  };
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string[];
  yearBuiltRange?: {
    min?: number;
    max?: number;
  };
  features?: string[];
  status?: ('active' | 'pending' | 'sold' | 'off-market')[];
  sortBy?: 'price' | 'dateAdded' | 'sizeAsc' | 'sizeDesc' | 'pricePerSqFt';
  limit?: number;
  offset?: number;
} 