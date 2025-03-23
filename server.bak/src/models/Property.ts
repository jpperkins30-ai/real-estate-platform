// src/models/Property.ts
import mongoose, { Schema, Document } from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Property:
 *       type: object
 *       required:
 *         - address
 *         - state
 *         - county
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         address:
 *           type: string
 *           description: Property address
 *         city:
 *           type: string
 *           description: City where property is located
 *         state:
 *           type: string
 *           description: State where property is located
 *         county:
 *           type: string
 *           description: County where property is located
 *         zipCode:
 *           type: string
 *           description: ZIP code
 *         propertyType:
 *           type: string
 *           description: Type of property (residential, commercial, etc.)
 *         price:
 *           type: number
 *           description: Property price/value
 *         saleType:
 *           type: string
 *           enum: [Tax Lien, Deed, Conventional]
 *           description: Type of sale
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the property was added
 */

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
  basement: Boolean,
  construction: String,
  condition: String,
  features: [String],
  improvements: [Schema.Types.Mixed]
}, { _id: false });

// Tax information sub-schema
const TaxInfoSchema = new Schema({
  assessedValue: Number,
  marketValue: Number,
  landValue: Number,
  improvementValue: Number,
  taxYear: Number,
  annualTax: Number,
  taxStatus: String,
  taxDue: Number,
  taxLiens: [Schema.Types.Mixed],
  exemptions: [Schema.Types.Mixed]
}, { _id: false });

// Sale information sub-schema
const SaleInfoSchema = new Schema({
  saleType: {
    type: String,
    enum: ['Tax Lien', 'Deed', 'Conventional'],
    default: 'Tax Lien'
  },
  saleStatus: String,
  saleDate: Date,
  saleAmount: Number,
  deedReference: String,
  purchaser: String,
  redemptionDeadline: Date,
  auctionInfo: Schema.Types.Mixed,
  previousSales: [Schema.Types.Mixed]
}, { _id: false });

// Geolocation sub-schema
const GeoLocationSchema = new Schema({
  latitude: Number,
  longitude: Number,
  coordinates: {
    type: [Number], // [longitude, latitude]
    index: '2dsphere'
  },
  geojson: Schema.Types.Mixed
}, { _id: false });

// Main Property schema
const PropertySchema = new Schema({
  parcelId: {
    type: String,
    required: true,
    index: true
  },
  taxAccountNumber: {
    type: String,
    index: true
  },
  ownerName: String,
  propertyAddress: String,
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
  propertyType: {
    type: String,
    index: true
  },
  landUse: String,
  zoning: String,
  propertyDetails: PropertyDetailsSchema,
  taxInfo: TaxInfoSchema,
  saleInfo: SaleInfoSchema,
  location: GeoLocationSchema,
  metadata: Schema.Types.Mixed,
  sourceId: {
    type: Schema.Types.ObjectId,
    ref: 'DataSource',
    index: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create compound indexes for efficient queries
PropertySchema.index({ state: 1, county: 1 });
PropertySchema.index({ propertyType: 1, 'saleInfo.saleType': 1 });
PropertySchema.index({ 'saleInfo.saleStatus': 1, lastUpdated: -1 });

export interface PropertyDocument extends Document {
  parcelId: string;
  taxAccountNumber?: string;
  ownerName?: string;
  propertyAddress?: string;
  city?: string;
  state: string;
  county: string;
  zipCode?: string;
  propertyType?: string;
  landUse?: string;
  zoning?: string;
  propertyDetails?: {
    landArea?: number;
    landAreaUnit?: string;
    buildingArea?: number;
    buildingAreaUnit?: string;
    yearBuilt?: number;
    stories?: number;
    bedrooms?: number;
    bathrooms?: number;
    basement?: boolean;
    construction?: string;
    condition?: string;
    features?: string[];
    improvements?: any[];
  };
  taxInfo?: {
    assessedValue?: number;
    marketValue?: number;
    landValue?: number;
    improvementValue?: number;
    taxYear?: number;
    annualTax?: number;
    taxStatus?: string;
    taxDue?: number;
    taxLiens?: any[];
    exemptions?: any[];
  };
  saleInfo?: {
    saleType?: 'Tax Lien' | 'Deed' | 'Conventional';
    saleStatus?: string;
    saleDate?: Date;
    saleAmount?: number;
    deedReference?: string;
    purchaser?: string;
    redemptionDeadline?: Date;
    auctionInfo?: any;
    previousSales?: any[];
  };
  location?: {
    latitude?: number;
    longitude?: number;
    coordinates?: [number, number];
    geojson?: any;
  };
  metadata?: any;
  sourceId: mongoose.Types.ObjectId;
  lastUpdated: Date;
  createdAt: Date;
}

export const Property = mongoose.model<PropertyDocument>('Property', PropertySchema);

export default Property;