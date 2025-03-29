/**
 * Property model - represents a real estate property
 * Consolidated from Property.ts and property.model.ts
 */

import mongoose, { Schema, Document } from 'mongoose';

// Property details sub-schema
const PropertyDetailsSchema = new Schema({
  landArea: Number,
  landAreaUnit: String,
  buildingArea: Number,
  buildingAreaUnit: String,
  yearBuilt: Number,
  stories: Number,
  bedrooms: Number,
  bathrooms: Number,
  features: [String],
  zoning: String,
  additionalDetails: Schema.Types.Mixed
}, { _id: false });

// Tax information sub-schema
const TaxInfoSchema = new Schema({
  assessedValue: Number,
  marketValue: Number,
  landValue: Number,
  improvementValue: Number,
  taxYear: Number,
  taxStatus: {
    type: String,
    enum: ['Paid', 'Delinquent', 'Unknown'],
    default: 'Unknown'
  },
  taxDue: Number,
  accountNumber: String,
  countySpecificData: Schema.Types.Mixed
}, { _id: false });

// Sale information sub-schema
const SaleInfoSchema = new Schema({
  saleType: {
    type: String,
    enum: ['Tax Lien', 'Deed', 'Conventional', 'Other'],
    default: 'Tax Lien'
  },
  saleStatus: String,
  saleDate: Date,
  saleAmount: Number,
  redemptionDeadline: Date,
  auctionInfo: Schema.Types.Mixed
}, { _id: false });

// Geolocation sub-schema
const GeoLocationSchema = new Schema({
  latitude: Number,
  longitude: Number,
  coordinates: {
    type: [Number], // [longitude, latitude]
    index: '2dsphere'
  },
  parcelId: String
}, { _id: false });

// Define a comprehensive Property interface
export interface IProperty extends Document {
  parcelId?: string;
  taxAccountNumber?: string;
  type?: string;
  parentId?: mongoose.Types.ObjectId;
  countyId: mongoose.Types.ObjectId;
  stateId: mongoose.Types.ObjectId;
  state?: string;
  county?: string;
  ownerName?: string;
  legalDescription?: string;
  propertyAddress: string;
  city?: string;
  zipCode?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    coordinates?: [number, number];
    parcelId?: string;
  };
  propertyType?: string;
  propertyDetails?: {
    landArea?: number;
    landAreaUnit?: string;
    buildingArea?: number;
    buildingAreaUnit?: string;
    yearBuilt?: number;
    stories?: number;
    bedrooms?: number;
    bathrooms?: number;
    features?: string[];
    zoning?: string;
    additionalDetails?: any;
  };
  taxInfo?: {
    assessedValue?: number;
    marketValue?: number;
    landValue?: number;
    improvementValue?: number;
    taxYear?: number;
    taxStatus?: string;
    taxDue?: number;
    accountNumber?: string;
    countySpecificData?: any;
  };
  saleInfo?: {
    saleType?: 'Tax Lien' | 'Deed' | 'Conventional' | 'Other';
    saleStatus?: string;
    saleDate?: Date;
    saleAmount?: number;
    redemptionDeadline?: Date;
    auctionInfo?: any;
  };
  geometry?: {
    type?: string;
    coordinates?: any;
  };
  metadata?: {
    propertyType?: string;
    yearBuilt?: number;
    landArea?: number;
    landAreaUnit?: string;
    buildingArea?: number;
    buildingAreaUnit?: string;
    taxStatus?: string;
    assessedValue?: number;
    marketValue?: number;
    taxDue?: number;
    saleType?: string;
    saleAmount?: number;
    saleDate?: Date;
    lastUpdated?: Date;
    dataSource?: string;
    lookupMethod?: string;
    sourceId?: mongoose.Types.ObjectId;
    collectionDate?: Date;
    processingNotes?: string[];
    rawData?: any;
  };
  controllers?: Array<{
    controllerId: mongoose.Types.ObjectId;
    controllerType: string;
    enabled: boolean;
    lastRun?: Date;
    nextScheduledRun?: Date;
    configuration?: any;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// Create the Property schema
const PropertySchema = new Schema({
  // Core identification
  parcelId: { type: String, index: true },
  taxAccountNumber: { type: String, index: true },
  type: { type: String, default: 'property' },
  parentId: { type: Schema.Types.ObjectId, ref: 'County' },
  
  // Owner information
  ownerName: String,
  legalDescription: String,
  
  // Location information
  propertyAddress: { type: String, required: true },
  city: String,
  state: { type: String, index: true },
  county: { type: String, index: true },
  zipCode: String,
  location: GeoLocationSchema,
  
  // Relationships to other entities
  countyId: { 
    type: Schema.Types.ObjectId, 
    ref: 'County',
    required: true,
    index: true
  },
  stateId: { 
    type: Schema.Types.ObjectId, 
    ref: 'State',
    required: true,
    index: true
  },
  
  // Property categorization and details
  propertyType: { type: String, index: true },
  propertyDetails: PropertyDetailsSchema,
  
  // Tax and sale information
  taxInfo: TaxInfoSchema,
  saleInfo: SaleInfoSchema,
  
  // GeoJSON for mapping
  geometry: {
    type: {
      type: String,
      enum: ['Point', 'Polygon', 'MultiPolygon'],
      required: false
    },
    coordinates: Schema.Types.Mixed // Can be [number, number] for Point or more complex for Polygons
  },
  
  // Legacy metadata fields for backward compatibility
  metadata: {
    propertyType: String,
    yearBuilt: Number,
    landArea: Number,
    landAreaUnit: String,
    buildingArea: Number,
    buildingAreaUnit: String,
    taxStatus: { 
      type: String, 
      enum: ['Paid', 'Delinquent', 'Unknown'], 
      default: 'Unknown'
    },
    assessedValue: Number,
    marketValue: Number,
    taxDue: Number,
    saleType: { 
      type: String, 
      enum: ['Tax Lien', 'Deed', 'Conventional', 'Other'] 
    },
    saleAmount: Number,
    saleDate: Date,
    lastUpdated: { type: Date, default: Date.now },
    dataSource: String,
    lookupMethod: { 
      type: String, 
      enum: ['account_number', 'parcel_id'] 
    },
    sourceId: Schema.Types.ObjectId,
    collectionDate: Date,
    processingNotes: [String],
    rawData: Schema.Types.Mixed
  },
  
  // Controllers configuration
  controllers: [{
    controllerId: { type: Schema.Types.ObjectId, required: true, ref: 'Controller' },
    controllerType: { 
      type: String, 
      required: true, 
      enum: ['Tax Sale', 'Map', 'Property', 'Demographics'] 
    },
    enabled: { type: Boolean, required: true, default: true },
    lastRun: Date,
    nextScheduledRun: Date,
    configuration: Schema.Types.Mixed
  }]
}, {
  timestamps: true,
  strict: false  // Allow additional fields not defined in schema
});

// Create indexes for common search fields
PropertySchema.index({ 'metadata.propertyType': 1 });
PropertySchema.index({ 'metadata.taxStatus': 1 });
PropertySchema.index({ 'metadata.saleType': 1 });
PropertySchema.index({ 'metadata.dataSource': 1 });
PropertySchema.index({ parcelId: 1 });
PropertySchema.index({ taxAccountNumber: 1 });
PropertySchema.index({ propertyAddress: 1 });
PropertySchema.index({ ownerName: 1 });
PropertySchema.index({ 'location.coordinates': '2dsphere' });
PropertySchema.index({ 'saleInfo.saleDate': 1 });
PropertySchema.index({ createdAt: 1 });
PropertySchema.index({ updatedAt: 1 });

// Create compound indexes for efficient queries
PropertySchema.index({ "countyId": 1, "parcelId": 1 });
PropertySchema.index({ "countyId": 1, "taxAccountNumber": 1 });
PropertySchema.index({ "stateId": 1, "countyId": 1 });

// Create a text index for searching
PropertySchema.index({ 
  ownerName: 'text', 
  propertyAddress: 'text',
  city: 'text',
  parcelId: 'text',
  taxAccountNumber: 'text'
});

// Create a 2dsphere index for geospatial queries
PropertySchema.index({ "geometry": "2dsphere" }, { sparse: true });

// Create and export the model
export const Property = mongoose.models.Property || mongoose.model<IProperty>('Property', PropertySchema);

// Default export for backward compatibility
export default Property; 