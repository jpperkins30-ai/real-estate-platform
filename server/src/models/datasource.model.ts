import mongoose, { Schema, Document } from 'mongoose';
import { DataSourceDocument } from '../types/inventory';

// Create the DataSource schema
const DataSourceSchema = new Schema<DataSourceDocument>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['county-website', 'state-records', 'tax-database', 'api', 'pdf'],
  },
  url: {
    type: String,
    required: true,
    trim: true,
  },
  region: {
    state: {
      type: String,
      required: true,
      trim: true,
    },
    county: {
      type: String,
      trim: true,
    },
  },
  collectorType: {
    type: String,
    required: true,
    trim: true,
  },
  schedule: {
    frequency: {
      type: String,
      required: true,
      enum: ['hourly', 'daily', 'weekly', 'monthly', 'manual'],
      default: 'daily',
    },
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
    },
    dayOfMonth: {
      type: Number,
      min: 1,
      max: 31,
    },
  },
  metadata: {
    lookupMethod: {
      type: String,
      enum: ['account_number', 'parcel_id'],
    },
    selectors: {
      type: Schema.Types.Mixed,
    },
    lienUrl: {
      type: String,
      trim: true,
    },
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive', 'error'],
    default: 'inactive',
  },
  lastCollected: {
    type: Date,
  },
  errorMessage: {
    type: String,
  },
}, {
  timestamps: true
});

// Create indexes for common search fields
DataSourceSchema.index({ name: 1 }, { unique: true });
DataSourceSchema.index({ type: 1 });
DataSourceSchema.index({ collectorType: 1 });
DataSourceSchema.index({ 'region.state': 1, 'region.county': 1 });
DataSourceSchema.index({ status: 1 });

// Create and export the model
export const DataSource = mongoose.model<DataSourceDocument>('DataSource', DataSourceSchema); 