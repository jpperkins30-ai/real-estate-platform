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
  taxStatus: String,
  taxDue: Number,
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
  }
}, { _id: false });

// Main Property schema
const PropertySchema = new Schema({
  // Core identification
  parcelId: {
    type: String,
    index: true
  },
  taxAccountNumber: {
    type: String,
    index: true
  },
  ownerName: String,
  legalDescription: String,
  
  // Location information
  propertyAddress: {
    type: String,
    required: true
  },
  city: String,
  state: {
    type: String,
    required: true,
    index: true
  },
  county: {
    type: String,
    required: true,
    index: true
  },
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
  
  // Property details
  propertyType: {
    type: String,
    required: true,
    index: true
  },
  propertyDetails: PropertyDetailsSchema,
  
  // Tax information
  taxInfo: TaxInfoSchema,
  
  // Sale information
  saleInfo: SaleInfoSchema,
  
  // GeoJSON for mapping
  geometry: {
    type: {
      type: String,
      enum: ['Point', 'Polygon', 'MultiPolygon'],
      required: false
    },
    coordinates: {
      type: Schema.Types.Mixed, // Can be [number, number] for Point or more complex for Polygons
      required: false
    }
  },
  

  // Metadata and collection tracking
  metadata: {
    sourceId: Schema.Types.ObjectId,
    collectionDate: Date,
    lastUpdated: Date,
    processingNotes: [String],
    rawData: Schema.Types.Mixed
  }
}, {
  timestamps: true,
  strict: false  // Allow additional fields not defined in schema
});


// Create base indexes for common search fields
PropertySchema.index({ propertyAddress: 1 });
PropertySchema.index({ parcelId: 1 });
PropertySchema.index({ taxAccountNumber: 1 });
PropertySchema.index({ state: 1, county: 1 });
PropertySchema.index({ ownerName: 1 });
PropertySchema.index({ 'location.coordinates': '2dsphere' });


// Create indexes for efficient queries
PropertySchema.index({ state: 1, county: 1 });
PropertySchema.index({ propertyAddress: 1 });
PropertySchema.index({ ownerName: 1 });
PropertySchema.index({ parcelId: 1 });
PropertySchema.index({ 'location.coordinates': '2dsphere' });
PropertySchema.index({ 'saleInfo.saleDate': 1 });
PropertySchema.index({ createdAt: 1 });
PropertySchema.index({ updatedAt: 1 });


// Create compound indexes for efficient queries
PropertySchema.index({ "countyId": 1, "parcelId": 1 }, { unique: true });
PropertySchema.index({ "countyId": 1, "taxAccountNumber": 1 });
PropertySchema.index({ "stateId": 1, "countyId": 1 });

// Create a text index for searching
PropertySchema.index({ "ownerName": "text", "propertyAddress": "text" });

// Create a 2dsphere index for geospatial queries
PropertySchema.index({ "geometry": "2dsphere" }, { sparse: true });

// Define the TypeScript interface for the Property document
export interface PropertyDocument extends Document {
  parcelId?: string;
  taxAccountNumber?: string;
  ownerName?: string;
  legalDescription?: string;
  propertyAddress: string;
  city?: string;
  state: string;
  county: string;
  zipCode?: string;
  countyId: mongoose.Types.ObjectId;
  stateId: mongoose.Types.ObjectId;

  propertyType: string;
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
  location?: {
    latitude?: number;
    longitude?: number;
    coordinates?: [number, number];
  };
  geometry?: {
    type?: 'Point' | 'Polygon' | 'MultiPolygon';
    coordinates?: any;
  };

  metadata?: {
    sourceId?: mongoose.Types.ObjectId;
    collectionDate?: Date;
    lastUpdated?: Date;
    processingNotes?: string[];
    rawData?: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const Property = mongoose.model<PropertyDocument>('Property', PropertySchema);

export default Property; 