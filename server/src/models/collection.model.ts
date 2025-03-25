import mongoose, { Schema, Document } from 'mongoose';
import { CollectionObject, CollectionExecutionStatus } from '../types/inventory';

// Extend the CollectionObject interface to include Mongoose document properties
export interface ICollection extends Omit<CollectionObject, '_id'>, Document {}

// Create the Collection schema
const CollectionSchema = new Schema<ICollection>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  sourceId: { type: String, required: true, ref: 'DataSource' },
  enabled: { type: Boolean, required: true, default: true },
  schedule: {
    enabled: { type: Boolean, default: false },
    cronExpression: String,
    timezone: String
  },
  mapping: [{
    source: { type: String, required: true },
    target: { type: String, required: true },
    transform: String
  }],
  filters: Schema.Types.Mixed,
  lastRun: Date,
  nextScheduledRun: Date,
  executionHistory: [{
    id: { type: String, required: true },
    timestamp: { type: Date, required: true },
    status: { type: String, required: true, enum: ['Success', 'Failed', 'In Progress', 'Scheduled'] },
    duration: Number,
    error: String,
    result: {
      recordsProcessed: Number,
      recordsCreated: Number,
      recordsUpdated: Number,
      recordsFailed: Number,
      additionalInfo: Schema.Types.Mixed
    }
  }],
  status: { type: String, required: true, enum: ['Active', 'Inactive', 'Error', 'Running'], default: 'Inactive' },
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
CollectionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes for common search fields
CollectionSchema.index({ sourceId: 1 });
CollectionSchema.index({ enabled: 1 });
CollectionSchema.index({ status: 1 });
CollectionSchema.index({ 'schedule.enabled': 1 });
CollectionSchema.index({ 'metadata.tags': 1 });

// Create and export the model
export const Collection = mongoose.model<ICollection>('Collection', CollectionSchema); 