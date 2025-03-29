/**
 * USMap model - represents the root geographic entity for the United States
 */

import mongoose, { Schema } from 'mongoose';
import { USMapDocument, ControllerReference, Statistics } from '../types/inventory';

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
  enabled: {
    type: Boolean,
    default: true
  },
  lastRun: Date,
  nextScheduledRun: Date,
  configuration: Schema.Types.Mixed
}, { _id: false });

const StatisticsSchema = new Schema({
  totalTaxLiens: {
    type: Number,
    default: 0
  },
  totalValue: {
    type: Number,
    default: 0
  }
}, { _id: false });

const USMapSchema = new Schema<USMapDocument>({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'us_map'
  },
  metadata: {
    totalStates: {
      type: Number,
      default: 0
    },
    totalCounties: {
      type: Number,
      default: 0
    },
    totalProperties: {
      type: Number,
      default: 0
    },
    statistics: {
      type: StatisticsSchema,
      default: () => ({})
    }
  },
  controllers: [ControllerReferenceSchema]
}, {
  timestamps: true
});

// Create indexes for common search fields
USMapSchema.index({ name: 1 });
USMapSchema.index({ 'metadata.totalProperties': 1 });

// Create and export the model
export const USMap = mongoose.models.USMap || mongoose.model<USMapDocument>('USMap', USMapSchema); 