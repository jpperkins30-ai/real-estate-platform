/**
 * USMap model - represents the root geographic entity for the inventory system
 * Consolidated from USMap.ts and usmap.model.ts
 */

import mongoose, { Schema, Document } from 'mongoose';
import { geometrySchema, statisticsSchema, baseMetadataSchema } from './geo-schemas';
import { USMapDocument, ControllerReference, Statistics } from '../types/inventory';

// Interface for USMap Document
export interface IUSMap extends Document {
  name: string;
  type: string;
  geometry?: {
    type: string;
    coordinates: any[];
  };
  metadata: {
    totalStates: number;
    totalCounties: number;
    totalProperties: number;
    statistics: {
      totalTaxLiens: number;
      totalValue: number;
      lastUpdated?: Date;
    };
    createdAt?: Date;
    updatedAt?: Date;
    lastModifiedBy?: string;
  };
  controllers?: Array<{
    controllerId: mongoose.Types.ObjectId;
    controllerType: string;
    enabled: boolean;
    lastRun?: Date;
    nextScheduledRun?: Date;
    configuration?: any;
  }>;
  states?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Controller reference schema
const ControllerReferenceSchema = new Schema({
  controllerId: { 
    type: Schema.Types.ObjectId,
    ref: 'Controller',
    required: true 
  },
  controllerType: { 
    type: String, 
    enum: ['Tax Sale', 'Map', 'Property', 'Demographics'],
    required: true 
  },
  enabled: { type: Boolean, required: true, default: true },
  lastRun: { type: Date },
  nextScheduledRun: { type: Date },
  configuration: { type: Schema.Types.Mixed }
}, { _id: false });

// Statistics Schema
const StatisticsSchema = new Schema({
  totalTaxLiens: {
    type: Number,
    default: 0
  },
  totalValue: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Combined metadata schema for USMap
const usMapMetadataSchema = new Schema({
  totalStates: { type: Number, default: 0 },
  totalCounties: { type: Number, default: 0 },
  totalProperties: { type: Number, default: 0 },
  statistics: { 
    type: StatisticsSchema,
    default: () => ({})
  }
}, { _id: false }).add(baseMetadataSchema);

// USMap Schema
const USMapSchema = new Schema<IUSMap>({
  name: { type: String, required: true, default: 'US Map' },
  type: { type: String, required: true, default: 'us_map' },
  geometry: { 
    type: geometrySchema,
    required: false // USMap doesn't necessarily need geometry
  },
  metadata: { type: usMapMetadataSchema, default: () => ({}) },
  controllers: [ControllerReferenceSchema],
  states: [{ type: Schema.Types.ObjectId, ref: 'State' }]
}, {
  timestamps: true,
  collection: 'usmap' // Use the specified collection name
});

// Create indexes for common search fields
USMapSchema.index({ name: 1 });
USMapSchema.index({ 'metadata.totalProperties': 1 });

// Add a virtual for 'id' to maintain consistent API
USMapSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Ensure virtuals are included when converting to JSON/Object
USMapSchema.set('toJSON', { virtuals: true });
USMapSchema.set('toObject', { virtuals: true });

// Update the timestamps before saving
USMapSchema.pre('save', function(next) {
  this.set('updatedAt', new Date());
  next();
});

// Create the model, ensuring we don't recreate if it exists
export const USMap = mongoose.models.USMap || mongoose.model<IUSMap>('USMap', USMapSchema);

// Default export for compatibility
export default USMap; 