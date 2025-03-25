/**
 * Types for the inventory module
 */

// Controller Type
export interface ControllerTypeInfo {
  id: string;
  name: string;
  description: string;
}

// State
export interface State {
  id: string;
  name: string;
  abbreviation: string;
  type: 'state';
  parentId?: string;
  region?: string;
  geometry?: GeoJsonGeometry;
  metadata?: {
    totalCounties: number;
    totalProperties: number;
    statistics: Statistics;
  };
  controllers?: ControllerReference[];
  createdAt: string;
  updatedAt: string;
}

/**
 * County search configuration
 */
export interface SearchConfig {
  searchUrl?: string;
  lookupMethod: 'account_number' | 'parcel_id';
  selectors: Record<string, string>;
  lienUrl?: string;
}

// County
export interface County {
  id: string;
  name: string;
  stateId: string;
  type: 'county';
  parentId: string;
  fips?: string;
  population?: number;
  area?: number;
  geometry?: GeoJsonGeometry;
  metadata?: {
    totalProperties: number;
    statistics: Statistics;
    searchConfig?: SearchConfig;
  };
  controllers?: ControllerReference[];
  dataLastUpdated?: string;
  createdAt: string;
  updatedAt: string;
}

// Property
export interface Property {
  id: string;
  parcelId: string;
  taxAccountNumber: string;
  type: 'property';
  parentId: string;
  countyId: string;
  stateId: string;
  ownerName: string;
  propertyAddress: string;
  city?: string;
  zipCode?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  location?: {
    lat: number;
    lng: number;
  };
  geometry?: {
    type: 'Point' | 'Polygon';
    coordinates: number[] | number[][][]; // [lng, lat] for Point or [[[lng, lat]]] for Polygon
  };
  propertyType?: string;
  zoning?: string;
  lotSize?: number;
  buildingSize?: number;
  bedrooms?: number;
  bathrooms?: number;
  yearBuilt?: number;
  lastSaleDate?: string;
  lastSalePrice?: number;
  taxAssessedValue?: number;
  taxYear?: number;
  metadata: {
    propertyType: string;
    yearBuilt?: number;
    landArea?: number;
    landAreaUnit?: string;
    buildingArea?: number;
    buildingAreaUnit?: string;
    taxStatus: 'Paid' | 'Delinquent' | 'Unknown';
    assessedValue?: number;
    marketValue?: number;
    taxDue?: number;
    saleType?: 'Tax Lien' | 'Deed' | 'Conventional' | 'Other';
    saleAmount?: number;
    saleDate?: string;
    lastUpdated: string;
    dataSource?: string;
    lookupMethod?: 'account_number' | 'parcel_id';
    rawData?: Record<string, any>;
  };
  status?: 'active' | 'inactive' | 'pending';
  tags?: string[];
  images?: string[];
  controllers?: ControllerReference[];
  createdAt: string;
  updatedAt: string;
}

// Controller Reference
export interface ControllerReference {
  controllerId: string;
  controllerType: 'Tax Sale' | 'Map' | 'Property' | 'Demographics';
  enabled: boolean;
  lastRun?: string;
  nextScheduledRun?: string;
  configuration?: Record<string, any>;
}

// Data Source
export interface DataSource {
  id: string;
  name: string;
  type: string;
  url: string;
  region?: {
    state?: string;
    county?: string;
  };
  collectorType: string;
  schedule: {
    frequency: string;
    lastRun?: Date;
    nextRun?: Date;
  };
  metadata: Record<string, any>;
}

// Collector Type
export interface CollectorType {
  id: string;
  name: string;
  description: string;
  supportedSourceTypes: string[];
}

// Controller
export interface Controller {
  id: string;
  name: string;
  type: string;
  controllerType: ControllerType;
  description?: string;
  enabled?: boolean;
  configTemplate?: {
    requiredFields: string[];
    optionalFields: Record<string, any>;
  };
  attachedTo?: {
    objectId: string;
    objectType: ControllableObjectType;
  }[];
  implementation?: {
    collectorType: string;
    supportedSourceTypes: string[];
    additionalConfig?: Record<string, any>;
  };
  config?: {
    schedule: {
      enabled: boolean;
      cronExpression?: string;
      timezone?: string;
    };
    retryPolicy?: {
      enabled: boolean;
      maxAttempts?: number;
      delayMs?: number;
      backoffMultiplier?: number;
    };
    notificationSettings?: {
      email?: string[];
      slack?: string[];
      webhook?: string[];
      onSuccess?: boolean;
      onFailure?: boolean;
    };
    filters?: {
      objectTypes?: string[];
      objectIds?: string[];
      additionalFilters?: Record<string, any>;
    };
    parameters?: Record<string, any>;
  };
  lastRun?: Date;
  nextScheduledRun?: Date;
  executionHistory?: {
    id: string;
    timestamp: Date;
    status: 'Success' | 'Failed' | 'In Progress' | 'Scheduled';
    duration?: number;
    error?: string;
    result?: Record<string, any>;
    metadata?: {
      objectsProcessed?: number;
      objectsUpdated?: number;
      objectsFailed?: number;
      additionalInfo?: Record<string, any>;
    };
  }[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    version?: string;
    author?: string;
    tags?: string[];
    notes?: string[];
  };
}

/**
 * Types of controllers supported in the system
 */
export type ControllerType = 'Tax Sale' | 'Map' | 'Property' | 'Demographics';

/**
 * Types of objects that can have controllers attached
 */
export type ControllableObjectType = 'us_map' | 'state' | 'county' | 'property';

/**
 * Configuration template for a controller
 */
export interface ControllerConfigTemplate {
  requiredFields: string[];
  optionalFields: Record<string, any>;
}

/**
 * Reference to an object that has a controller attached
 */
export interface ControllerAttachment {
  objectId: string;
  objectType: ControllableObjectType;
}

/**
 * Implementation details for a controller
 */
export interface ControllerImplementation {
  collectorType: string;
  supportedSourceTypes: string[];
  // Additional implementation details can be added here
}

/**
 * Controller object representing a data collection or processing controller
 */
export interface ControllerObject {
  id: string;
  name: string;
  type: 'controller';
  controllerType: ControllerType;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  configTemplate: ControllerConfigTemplate;
  attachedTo: ControllerAttachment[];
  implementation: ControllerImplementation;
}

/**
 * Statistics for the US Map and its child objects
 */
export interface USMapStatistics {
  totalTaxLiens: number;
  totalValue: number;
  averagePropertyValue?: number;
  totalPropertiesWithLiens?: number;
  lastUpdated: Date;
}

/**
 * Metadata for the US Map object
 */
export interface USMapMetadata {
  totalStates: number;
  totalCounties: number;
  totalProperties: number;
  statistics: USMapStatistics;
}

/**
 * Root object representing the entire US Map
 */
export interface USMapObject {
  id: string;
  name: string;
  type: 'us_map';
  createdAt: Date;
  updatedAt: Date;
  metadata: USMapMetadata;
  controllers: ControllerReference[];
  states: StateObject[];  // Child objects
}

/**
 * Statistics specific to a state
 */
export interface StateStatistics {
  totalTaxLiens: number;
  totalValue: number;
  averagePropertyValue?: number;
  totalPropertiesWithLiens?: number;
  lastUpdated: Date;
}

/**
 * Metadata specific to a state
 */
export interface StateMetadata {
  totalCounties: number;
  totalProperties: number;
  statistics: StateStatistics;
}

/**
 * GeoJSON geometry types supported for states
 */
export type StateGeometryType = 'Polygon' | 'MultiPolygon';

/**
 * GeoJSON geometry for state boundaries
 */
export interface StateGeometry {
  type: StateGeometryType;
  coordinates: number[][][];  // GeoJSON format
}

/**
 * State object representing a US state
 */
export interface StateObject {
  _id: string;
  name: string;
  abbreviation: string;
  createdAt: string;
  updatedAt: string;
  geometry: any; // GeoJSON geometry
  metadata: {
    totalCounties: number;
    totalProperties: number;
    statistics: {
      totalTaxLiens: number;
      totalValue: number;
      averagePropertyValue: number;
      lastUpdated: string;
    }
  };
  controllers: ControllerReference[];
}

/**
 * Statistics specific to a county
 */
export interface CountyStatistics {
  totalTaxLiens: number;
  totalValue: number;
  averagePropertyValue?: number;
  totalPropertiesWithLiens?: number;
  lastUpdated: Date;
}

/**
 * County search configuration
 */
export interface CountySearchConfig {
  searchUrl: string;
  lookupMethod: 'account_number' | 'parcel_id';
  selectors: Record<string, string>;
  lienUrl?: string;
}

/**
 * Metadata specific to a county
 */
export interface CountyMetadata {
  totalProperties: number;
  statistics: CountyStatistics;
  searchConfig: CountySearchConfig;
}

/**
 * GeoJSON geometry types supported for counties
 */
export type CountyGeometryType = 'Polygon' | 'MultiPolygon';

/**
 * GeoJSON geometry for county boundaries
 */
export interface CountyGeometry {
  type: CountyGeometryType;
  coordinates: number[][][];  // GeoJSON format
}

/**
 * County object representing a US county
 */
export interface CountyObject {
  _id: string;
  name: string;
  stateId: string;
  createdAt: string;
  updatedAt: string;
  geometry: any; // GeoJSON geometry
  metadata: {
    totalProperties: number;
    statistics: {
      totalTaxLiens: number;
      totalValue: number;
      averagePropertyValue: number;
    }
  };
}

/**
 * Property geometry types supported
 */
export type PropertyGeometryType = 'Point' | 'Polygon';

/**
 * Property geometry coordinates type
 */
export type PropertyGeometryCoordinates = number[] | number[][][];

/**
 * GeoJSON geometry for property location
 */
export interface PropertyGeometry {
  type: PropertyGeometryType;
  coordinates: PropertyGeometryCoordinates;
}

/**
 * Property tax status
 */
export type PropertyTaxStatus = 'Paid' | 'Delinquent' | 'Unknown';

/**
 * Property sale type
 */
export type PropertySaleType = 'Tax Lien' | 'Deed' | 'Conventional' | 'Other';

/**
 * Property metadata containing all property details
 */
export interface PropertyMetadata {
  // Property details
  propertyType: string;
  yearBuilt?: number;
  landArea?: number;
  landAreaUnit?: string;
  buildingArea?: number;
  buildingAreaUnit?: string;
  
  // Tax information
  taxStatus: PropertyTaxStatus;
  assessedValue?: number;
  marketValue?: number;
  taxDue?: number;
  
  // Sale information
  saleType?: PropertySaleType;
  saleAmount?: number;
  saleDate?: Date;
  
  // Collection metadata
  lastUpdated: Date;
  dataSource: string;
  lookupMethod: 'account_number' | 'parcel_id';
  rawData?: Record<string, any>;
}

/**
 * Property object representing a real estate property
 */
export interface PropertyObject {
  _id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  countyId: string;
  stateId: string;
  parcelId: string;
  taxStatus: string;
  value: number;
  acreage: number;
  createdAt: string;
  updatedAt: string;
  geometry: any; // GeoJSON point
  metadata: {
    hasTaxLien: boolean;
    assessedValue: number;
    marketValue: number;
    lastAssessment: string;
    zoning: string;
  };
}

/**
 * Types of data sources supported
 */
export type DataSourceType = 'county-website' | 'state-records' | 'tax-database' | 'api' | 'pdf';

/**
 * Types of collection frequencies supported
 */
export type CollectionFrequency = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'manual';

/**
 * Types of lookup methods supported
 */
export type LookupMethod = 'account_number' | 'parcel_id';

/**
 * Types of data source status
 */
export type DataSourceStatus = 'active' | 'inactive' | 'error';

/**
 * Region information for a data source
 */
export interface DataSourceRegion {
  state: string;
  county?: string;
}

/**
 * Schedule configuration for data collection
 */
export interface DataSourceSchedule {
  frequency: CollectionFrequency;
  dayOfWeek?: number;
  dayOfMonth?: number;
}

/**
 * Selectors for data extraction
 */
export interface DataSourceSelectors {
  ownerName: string;
  propertyAddress: string;
  marketValue: string;
  taxStatus: string;
  [key: string]: string;
}

/**
 * Metadata for data source configuration
 */
export interface DataSourceMetadata {
  lookupMethod: LookupMethod;
  selectors: DataSourceSelectors;
  lienUrl?: string;
}

/**
 * Configuration for a data source
 */
export interface DataSourceConfig {
  id: string;
  name: string;
  type: DataSourceType;
  url: string;
  region: DataSourceRegion;
  collectorType: string;
  schedule: DataSourceSchedule;
  metadata: DataSourceMetadata;
  status: DataSourceStatus;
  lastCollected?: Date;
  errorMessage?: string;
}

export interface PropertyFilters {
  propertyType?: string;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  minYearBuilt?: number;
  maxYearBuilt?: number;
  minLotSize?: number;
  maxLotSize?: number;
  status?: string;
  hasTaxLien?: boolean;
  taxLienStatus?: string;
  [key: string]: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Statistics {
  totalTaxLiens: number;
  totalValue: number;
  averagePropertyValue?: number;
  totalPropertiesWithLiens?: number;
  lastUpdated?: string;
}

export interface GeoJsonGeometry {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: number[][][];
} 