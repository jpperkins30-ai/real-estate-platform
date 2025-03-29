/**
 * Basic API types for the real estate platform
 */

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FilterParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  [key: string]: any;
}

// Entity Types
export interface State {
  id: string;
  name: string;
  abbreviation: string;
  type?: string;
  region?: string;
  parentId?: string;
  metadata?: {
    totalCounties: number;
    totalProperties: number;
    statistics: {
      totalTaxLiens: number;
      totalValue: number;
      averagePropertyValue: number;
    }
  };
  createdAt: string;
  updatedAt: string;
}

export interface County {
  id: string;
  name: string;
  stateId: string;
  state?: State;
  fips?: string;
  population?: number;
  area?: number;
  totalProperties?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  parcelId: string;
  taxAccountNumber: string;
  countyId: string;
  stateId: string;
  ownerName: string;
  propertyAddress: string;
  city?: string;
  zipCode?: string;
  propertyType?: string;
  taxStatus?: string;
  assessedValue?: number;
  marketValue?: number;
  taxDue?: number;
  createdAt: string;
  updatedAt: string;
}

// Request Types
export interface StateFilterParams extends FilterParams {
  region?: string;
}

export interface CountyFilterParams extends FilterParams {
  stateId?: string;
  minPopulation?: number;
  maxPopulation?: number;
}

export interface PropertyFilterParams extends FilterParams {
  stateId?: string;
  countyId?: string;
  propertyType?: string;
  taxStatus?: string;
  minValue?: number;
  maxValue?: number;
  ownerName?: string;
}

// Export Types
export interface ExportOptions {
  format: 'csv' | 'excel' | 'json';
  entityType: 'properties' | 'counties' | 'states';
  filters?: any;
} 