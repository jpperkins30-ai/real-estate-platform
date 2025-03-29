import { Document, Schema } from 'mongoose';

/**
 * Types of controllers supported in the system
 */
export type ControllerType = 'Tax Sale' | 'Map' | 'Property' | 'Demographics';

/**
 * Reference to a controller that manages this object
 */
export interface ControllerReference {
  controllerId: Schema.Types.ObjectId;
  controllerType: ControllerType;
  enabled: boolean;
  lastRun?: Date;
  nextScheduledRun?: Date;
  configuration?: any;
}

/**
 * Statistics for the US Map and its child objects
 */
export interface USMapStatistics {
  totalTaxLiens: number;
  totalValue: number;
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
  _id?: string;  // Mongoose document ID
  id: string;    // Business ID
  name: string;
  type: 'us_map';
  metadata: USMapMetadata;
  controllers: ControllerReference[];
  createdAt: Date;
  updatedAt: Date;
  states: string[];  // Array of state IDs
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
  _id?: string;  // Mongoose document ID
  id: string;    // Business ID
  name: string;
  abbreviation: string;
  type: 'state';
  parentId: string;  // Reference to US Map Object
  createdAt: Date;
  updatedAt: Date;
  geometry: StateGeometry;
  metadata: StateMetadata;
  controllers: ControllerReference[];
  counties: string[];  // Array of county IDs
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
 * Metadata specific to a county
 */
export interface CountyMetadata {
  totalProperties: number;
  statistics: CountyStatistics;
  searchConfig: {
    searchUrl?: string;
    lookupMethod?: 'account_number' | 'parcel_id';
    selectors?: any;
    lienUrl?: string;
  };
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
 * Search configuration for a county
 */
export interface CountySearchConfig {
  enabled: boolean;
  lastRun?: Date;
  nextScheduledRun?: Date;
  searchCriteria: {
    propertyTypes?: string[];
    minValue?: number;
    maxValue?: number;
    minSquareFeet?: number;
    maxSquareFeet?: number;
    minBedrooms?: number;
    maxBedrooms?: number;
    minBathrooms?: number;
    maxBathrooms?: number;
    minYearBuilt?: number;
    maxYearBuilt?: number;
    minLotSize?: number;
    maxLotSize?: number;
    propertyConditions?: string[];
    additionalFilters?: Record<string, any>;
  };
  notificationSettings?: {
    email?: string[];
    slack?: string[];
    webhook?: string[];
  };
}

/**
 * County object representing a US county
 */
export interface CountyObject {
  _id?: string;  // Mongoose document ID
  id: string;    // Business ID
  name: string;
  type: 'county';
  parentId: string;  // Reference to State Object
  createdAt: Date;
  updatedAt: Date;
  geometry: CountyGeometry;
  metadata: CountyMetadata;
  controllers: ControllerReference[];
  properties: string[];  // Array of property IDs
  searchConfig: CountySearchConfig;
}

/**
 * Property status types
 */
export type PropertyStatus = 'Active' | 'Pending' | 'Sold' | 'Foreclosed' | 'Tax Lien';

/**
 * Property type categories
 */
export type PropertyType = 'Single Family' | 'Multi Family' | 'Commercial' | 'Industrial' | 'Land' | 'Other';

/**
 * Property condition categories
 */
export type PropertyCondition = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Unknown';

/**
 * Tax status information for a property
 */
export interface PropertyTaxStatus {
  assessedValue: number;
  marketValue: number;
  lastAssessmentDate: Date;
  taxRate: number;
  annualTaxAmount: number;
  accountNumber?: string;
  taxLienAmount?: number;
  taxLienDate?: Date;
  taxLienStatus?: 'Active' | 'Paid' | 'Foreclosed';
  lastPaymentDate?: Date;
  nextPaymentDue?: Date;
  paymentHistory?: {
    date: Date;
    amount: number;
    type: 'Regular' | 'Lien' | 'Penalty';
    status: 'Paid' | 'Pending' | 'Failed';
  }[];
  lastUpdated: Date;
}

/**
 * Property location information
 */
export interface PropertyLocation {
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    county: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  parcelId?: string;
  legalDescription?: string;
}

/**
 * Property features and characteristics
 */
export interface PropertyFeatures {
  type: PropertyType;
  condition: PropertyCondition;
  yearBuilt?: number;
  squareFeet?: number;
  lotSize?: number;
  bedrooms?: number;
  bathrooms?: number;
  stories?: number;
  garage?: number;
  pool?: boolean;
  additionalFeatures?: string[];
}

/**
 * Property object representing a real estate property
 */
export interface PropertyObject {
  _id?: string;  // Mongoose document ID
  id: string;    // Business ID
  name: string;
  type: 'property';
  parentId: string;  // Reference to County Object
  createdAt: Date;
  updatedAt: Date;
  status: PropertyStatus;
  location: PropertyLocation;
  features: PropertyFeatures;
  taxStatus: PropertyTaxStatus;
  controllers: ControllerReference[];
  metadata: {
    lastInspected?: Date;
    lastModified?: Date;
    notes?: string[];
    tags?: string[];
  };
}

/**
 * Search criteria for property search endpoint
 */
export interface PropertySearchCriteria {
  propertyTypes?: PropertyType[];
  conditions?: PropertyCondition[];
  statuses?: PropertyStatus[];
  minValue?: number;
  maxValue?: number;
  minSquareFeet?: number;
  maxSquareFeet?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  minYearBuilt?: number;
  maxYearBuilt?: number;
  minLotSize?: number;
  maxLotSize?: number;
  hasTaxLien?: boolean;
  counties?: string[];
  states?: string[];
  tags?: string[];
  additionalFilters?: Record<string, any>;
}

/**
 * Search response for property search endpoint
 */
export interface PropertySearchResponse {
  properties: PropertyObject[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Controller execution status
 */
export type ControllerExecutionStatus = 'Success' | 'Failed' | 'In Progress' | 'Scheduled';

/**
 * Controller execution history entry
 */
export interface ControllerExecutionHistory {
  id: string;
  timestamp: Date;
  status: ControllerExecutionStatus;
  duration?: number;  // in milliseconds
  error?: string;
  result?: Record<string, any>;
  metadata?: {
    objectsProcessed?: number;
    objectsUpdated?: number;
    objectsFailed?: number;
    additionalInfo?: Record<string, any>;
  };
}

/**
 * Controller configuration schema
 */
export interface ControllerConfig {
  schedule?: {
    enabled: boolean;
    cronExpression: string;
    timezone: string;
  };
  retryPolicy?: {
    enabled: boolean;
    maxAttempts: number;
    delayMs: number;
    backoffMultiplier: number;
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
}

/**
 * Controller object representing a data controller
 */
export interface ControllerObject {
  _id?: string;  // Mongoose document ID
  id: string;    // Business ID
  name: string;
  type: ControllerType;
  description?: string;
  enabled: boolean;
  config: ControllerConfig;
  lastRun?: Date;
  nextScheduledRun?: Date;
  executionHistory: ControllerExecutionHistory[];
  attachedObjects: {
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
 * Object reference for controller attachment
 */
export interface ControllerObjectReference {
  objectId: string;
  objectType: string;
}

/**
 * Controller execution request
 */
export interface ControllerExecutionRequest {
  parameters?: Record<string, any>;
  filters?: {
    objectTypes?: string[];
    objectIds?: string[];
    additionalFilters?: Record<string, any>;
  };
  options?: {
    force?: boolean;
    dryRun?: boolean;
    priority?: 'low' | 'normal' | 'high';
  };
}

/**
 * Data source types supported in the system
 */
export type DataSourceType = 'Tax Sale' | 'Property Records' | 'Demographics' | 'Market Data' | 'Custom';

/**
 * Data source authentication types
 */
export type DataSourceAuthType = 'None' | 'API Key' | 'OAuth2' | 'Basic Auth' | 'Custom';

/**
 * Data source configuration
 */
export interface DataSourceConfig {
  type: DataSourceType;
  authType: DataSourceAuthType;
  baseUrl: string;
  endpoints: {
    [key: string]: string;
  };
  auth?: {
    apiKey?: string;
    username?: string;
    password?: string;
    clientId?: string;
    clientSecret?: string;
    tokenUrl?: string;
    scope?: string[];
  };
  headers?: Record<string, string>;
  parameters?: Record<string, any>;
  rateLimit?: {
    requestsPerMinute: number;
    burstSize: number;
  };
  retryPolicy?: {
    maxAttempts: number;
    delayMs: number;
    backoffMultiplier: number;
  };
  validation?: {
    enabled: boolean;
    schema?: Record<string, any>;
    rules?: Record<string, any>;
  };
}

/**
 * Data source object representing a data provider
 */
export interface DataSourceObject {
  _id?: string;  // Mongoose document ID
  id: string;    // Business ID
  name: string;
  description?: string;
  type: DataSourceType;
  enabled: boolean;
  config: DataSourceConfig;
  lastSync?: Date;
  nextSync?: Date;
  status: 'Active' | 'Inactive' | 'Error' | 'Syncing';
  error?: string;
  metadata?: {
    version?: string;
    author?: string;
    tags?: string[];
    notes?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Collection execution status
 */
export type CollectionExecutionStatus = 'Success' | 'Failed' | 'In Progress' | 'Scheduled';

/**
 * Collection execution history entry
 */
export interface CollectionExecutionHistory {
  id: string;
  timestamp: Date;
  status: CollectionExecutionStatus;
  duration?: number;  // in milliseconds
  error?: string;
  result?: {
    recordsProcessed: number;
    recordsCreated: number;
    recordsUpdated: number;
    recordsFailed: number;
    additionalInfo?: Record<string, any>;
  };
}

/**
 * Collection object representing a data collection task
 */
export interface CollectionObject {
  _id?: string;  // Mongoose document ID
  id: string;    // Business ID
  name: string;
  description?: string;
  sourceId: string;  // Reference to DataSourceObject
  enabled: boolean;
  schedule?: {
    enabled: boolean;
    cronExpression: string;
    timezone: string;
  };
  mapping: {
    source: string;
    target: string;
    transform?: string;
  }[];
  filters?: Record<string, any>;
  lastRun?: Date;
  nextScheduledRun?: Date;
  executionHistory: CollectionExecutionHistory[];
  status: 'Active' | 'Inactive' | 'Error' | 'Running';
  error?: string;
  metadata?: {
    version?: string;
    author?: string;
    tags?: string[];
    notes?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Collection execution request
 */
export interface CollectionExecutionRequest {
  parameters?: Record<string, any>;
  filters?: Record<string, any>;
  options?: {
    force?: boolean;
    dryRun?: boolean;
    priority?: 'low' | 'normal' | 'high';
  };
}

export interface Geometry {
  type: 'Point' | 'Polygon' | 'MultiPolygon';
  coordinates: number[] | number[][] | number[][][];
}

export interface USMapDocument extends Document {
  name: string;
  type: string;
  metadata: {
    totalStates: number;
    totalCounties: number;
    totalProperties: number;
    statistics: {
      totalTaxLiens: number;
      totalValue: number;
    }
  };
  controllers: [{
    controllerId: Schema.Types.ObjectId;
    controllerType: string;
    enabled: boolean;
    lastRun: Date;
    nextScheduledRun: Date;
    configuration: any;
  }];
  createdAt: Date;
  updatedAt: Date;
}

export interface StateDocument extends Document {
  name: string;
  abbreviation: string;
  type: string;
  parentId: string;
  geometry: Geometry;
  metadata: StateMetadata;
  controllers: ControllerReference[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CountyDocument extends Document {
  name: string;
  type: string;
  parentId: string;
  stateId: string;
  geometry: Geometry;
  metadata: CountyMetadata;
  controllers: ControllerReference[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyMetadata {
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
  saleDate?: Date;
  lastUpdated: Date;
  dataSource?: string;
  lookupMethod?: 'account_number' | 'parcel_id';
  rawData?: any;
}

export interface PropertyDocument extends Document {
  parcelId: string;
  taxAccountNumber: string;
  type: string;
  parentId: string;
  countyId: string;
  stateId: string;
  ownerName: string;
  propertyAddress: string;
  city?: string;
  zipCode?: string;
  geometry: Geometry;
  metadata: PropertyMetadata;
  controllers: ControllerReference[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ControllerDocument extends Document {
  name: string;
  type: string;
  controllerType: 'Tax Sale' | 'Map' | 'Property' | 'Demographics';
  description: string;
  configTemplate: {
    requiredFields: string[];
    optionalFields: any;
  };
  attachedTo: {
    objectId: string;
    objectType: 'us_map' | 'state' | 'county' | 'property';
  }[];
  implementation: {
    collectorType: string;
    supportedSourceTypes: string[];
    additionalConfig: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface DataSourceDocument extends Document {
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
  metadata: {
    lookupMethod: 'account_number' | 'parcel_id';
    selectors?: any;
    lienUrl?: string;
  };
  status: 'active' | 'inactive' | 'error';
  lastCollected?: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CollectionDocument extends Document {
  sourceId: Schema.Types.ObjectId;
  timestamp: Date;
  status: 'success' | 'partial' | 'error';
  stats: {
    duration: number;
    itemCount: number;
    successCount: number;
    errorCount: number;
    memoryUsage?: number;
  };
  errorLog: {
    message: string;
    timestamp: Date;
    stackTrace?: string;
  }[];
  properties: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Statistics {
  totalTaxLiens: number;
  totalValue: number;
} 