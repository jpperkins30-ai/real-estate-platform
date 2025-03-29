import mongoose, { Schema, Document } from 'mongoose';

// Define a comprehensive Property interface
export interface IProperty extends Document {
  parcelId: string;
  taxAccountNumber: string;
  type: string;
  parentId: mongoose.Types.ObjectId;
  countyId: mongoose.Types.ObjectId;
  stateId: mongoose.Types.ObjectId;
  ownerName: string;
  propertyAddress: string;
  city?: string;
  zipCode?: string;
  geometry?: {
    type: string;
    coordinates: any[];
  };
  metadata: {
    propertyType: string;
    yearBuilt?: number;
    landArea?: number;
    landAreaUnit?: string;
    buildingArea?: number;
    buildingAreaUnit?: string;
    taxStatus: string;
    assessedValue?: number;
    marketValue?: number;
    taxDue?: number;
    saleType?: string;
    saleAmount?: number;
    saleDate?: Date;
    lastUpdated: Date;
    dataSource?: string;
    lookupMethod?: string;
    rawData?: any;
  };
  controllers: Array<{
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
  parcelId: { type: String, required: true, index: true },
  taxAccountNumber: { type: String, required: true, index: true },
  type: { type: String, required: true, default: 'property' },
  parentId: { type: Schema.Types.ObjectId, required: true, ref: 'County' },
  countyId: { type: Schema.Types.ObjectId, required: true, ref: 'County' },
  stateId: { type: Schema.Types.ObjectId, required: true, ref: 'State' },
  ownerName: { type: String, required: true },
  propertyAddress: { type: String, required: true },
  city: { type: String },
  zipCode: { type: String },
  geometry: {
    type: { type: String, enum: ['Point', 'Polygon'], required: false },
    coordinates: { type: Array }
  },
  metadata: {
    propertyType: { type: String, required: true },
    yearBuilt: Number,
    landArea: Number,
    landAreaUnit: String,
    buildingArea: Number,
    buildingAreaUnit: String,
    taxStatus: { 
      type: String, 
      enum: ['Paid', 'Delinquent', 'Unknown'], 
      required: true,
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
    lastUpdated: { type: Date, required: true, default: Date.now },
    dataSource: String,
    lookupMethod: { 
      type: String, 
      enum: ['account_number', 'parcel_id'] 
    },
    rawData: Schema.Types.Mixed
  },
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
  timestamps: true
});

// Create indexes for common search fields
PropertySchema.index({ 'metadata.propertyType': 1 });
PropertySchema.index({ 'metadata.taxStatus': 1 });
PropertySchema.index({ 'metadata.saleType': 1 });
PropertySchema.index({ 'metadata.dataSource': 1 });
PropertySchema.index({ countyId: 1 });
PropertySchema.index({ stateId: 1 });

// Add text search indexes
PropertySchema.index({ 
  ownerName: 'text', 
  propertyAddress: 'text',
  city: 'text',
  parcelId: 'text',
  taxAccountNumber: 'text'
});

// Create and export the model
export const Property = mongoose.models.Property || mongoose.model<IProperty>('Property', PropertySchema); 