import mongoose, { Schema, Document } from 'mongoose';
import { DataSourceObject, DataSourceType, DataSourceAuthType } from '../types/inventory';

// Extend the DataSourceObject interface to include Mongoose document properties
export interface IDataSource extends Omit<DataSourceObject, '_id'>, Document {}

// Create the DataSource schema
const DataSourceSchema = new Schema<IDataSource>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  type: { type: String, required: true, enum: ['Tax Sale', 'Property Records', 'Demographics', 'Market Data', 'Custom'] },
  enabled: { type: Boolean, required: true, default: true },
  config: {
    type: { type: String, required: true },
    authType: { type: String, required: true, enum: ['None', 'API Key', 'OAuth2', 'Basic Auth', 'Custom'] },
    baseUrl: { type: String, required: true },
    endpoints: { type: Map, of: String },
    auth: {
      apiKey: String,
      username: String,
      password: String,
      clientId: String,
      clientSecret: String,
      tokenUrl: String,
      scope: [String]
    },
    headers: { type: Map, of: String },
    parameters: Schema.Types.Mixed,
    rateLimit: {
      requestsPerMinute: Number,
      burstSize: Number
    },
    retryPolicy: {
      maxAttempts: Number,
      delayMs: Number,
      backoffMultiplier: Number
    },
    validation: {
      enabled: { type: Boolean, default: false },
      schema: Schema.Types.Mixed,
      rules: Schema.Types.Mixed
    }
  },
  lastSync: Date,
  nextSync: Date,
  status: { type: String, required: true, enum: ['Active', 'Inactive', 'Error', 'Syncing'], default: 'Inactive' },
  error: String,
  metadata: {
    version: String,
    author: String,
    tags: [String],
    notes: [String]
  },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now }
}, {
  timestamps: true
});

// Update the updatedAt timestamp before saving
DataSourceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes for common search fields
DataSourceSchema.index({ type: 1 });
DataSourceSchema.index({ enabled: 1 });
DataSourceSchema.index({ status: 1 });
DataSourceSchema.index({ 'config.type': 1 });
DataSourceSchema.index({ 'metadata.tags': 1 });

// Create and export the model
export const DataSource = mongoose.model<IDataSource>('DataSource', DataSourceSchema); 