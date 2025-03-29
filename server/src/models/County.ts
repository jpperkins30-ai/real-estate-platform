/**
 * County model - represents a county within a US state
 */

import mongoose, { Schema, Document } from 'mongoose';

// Define the County document interface
export interface ICounty extends Document {
  name: string;
  type: string;
  parentId: mongoose.Types.ObjectId;
  stateId: mongoose.Types.ObjectId;
  geometry: {
    type: string;
    coordinates: any[][];
  };
  metadata: {
    totalProperties: number;
    statistics: {
      totalTaxLiens: number;
      totalValue: number;
    };
    searchConfig: {
      searchUrl?: string;
      lookupMethod?: string;
      selectors?: {
        ownerName?: string;
        propertyAddress?: string;
        marketValue?: string;
        taxStatus?: string;
      };
      lienUrl?: string;
    };
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

// Create the County schema
const CountySchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, default: 'county' },
  parentId: { type: Schema.Types.ObjectId, required: true, ref: 'State' },
  stateId: { type: Schema.Types.ObjectId, required: true, ref: 'State' },
  geometry: {
    type: { type: String, enum: ['Polygon', 'MultiPolygon'], required: true },
    coordinates: { type: Array, required: true } // GeoJSON format
  },
  metadata: {
    totalProperties: { type: Number, required: true, default: 0 },
    statistics: {
      totalTaxLiens: { type: Number, required: true, default: 0 },
      totalValue: { type: Number, required: true, default: 0 }
    },
    searchConfig: {
      searchUrl: String,
      lookupMethod: { type: String, enum: ['account_number', 'parcel_id'] },
      selectors: {
        ownerName: String,
        propertyAddress: String,
        marketValue: String,
        taxStatus: String
      },
      lienUrl: String
    }
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
CountySchema.index({ name: 1 });
CountySchema.index({ stateId: 1 });
CountySchema.index({ 'metadata.totalProperties': 1 });

// Create a compound index for stateId and name (unique)
CountySchema.index({ "stateId": 1, "name": 1 }, { unique: true });

// Create a 2dsphere index for geospatial queries
CountySchema.index({ "geometry": "2dsphere" });

// Create and export the model
export const County = mongoose.models.County || mongoose.model<ICounty>('County', CountySchema); 