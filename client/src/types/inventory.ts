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
  region?: string;
  createdAt: string;
  updatedAt: string;
}

// County
export interface County {
  id: string;
  name: string;
  stateId: string;
  fips?: string;
  population?: number;
  area?: number;
  dataLastUpdated?: string;
  createdAt: string;
  updatedAt: string;
}

// Property
export interface Property {
  id: string;
  countyId: string;
  parcelId?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  location?: {
    lat: number;
    lng: number;
  };
  propertyType: string;
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
  status: 'active' | 'inactive' | 'pending';
  tags?: string[];
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

// Controller Reference
export interface ControllerReference {
  controllerId: string;
  controllerType: string;
  enabled: boolean;
  lastRun?: Date;
  nextScheduledRun?: Date;
  configuration: Record<string, any>;
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
  description?: string;
  enabled: boolean;
  config: {
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
  attachedObjects?: {
    objectId: string;
    objectType: string;
    attachedAt: Date;
    lastProcessed?: Date;
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
  id: string;
  name: string;
  abbreviation: string;
  type: 'state';
  parentId: string;  // Reference to US Map Object
  createdAt: Date;
  updatedAt: Date;
  geometry: StateGeometry;
  metadata: StateMetadata;
  controllers: ControllerReference[];
  counties: CountyObject[];  // Child objects
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
  id: string;
  name: string;
  type: 'county';
  parentId: string;  // Reference to State Object
  stateId: string;   // Direct reference to state for quicker lookups
  createdAt: Date;
  updatedAt: Date;
  geometry: CountyGeometry;
  metadata: CountyMetadata;
  controllers: ControllerReference[];
  properties: PropertyObject[];  // Child objects
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
  id: string;
  parcelId: string;
  taxAccountNumber: string;
  type: 'property';
  parentId: string;  // Reference to County Object
  countyId: string;  // Direct reference to county
  stateId: string;   // Direct reference to state
  createdAt: Date;
  updatedAt: Date;
  ownerName: string;
  propertyAddress: string;
  city?: string;
  zipCode?: string;
  geometry?: PropertyGeometry;
  metadata: PropertyMetadata;
  controllers: ControllerReference[];
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
  [key: string]: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 