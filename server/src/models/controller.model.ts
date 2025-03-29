// @ts-nocheck
import mongoose, { Schema, Document } from 'mongoose';
import { ControllerObject, ControllerType, ControllerExecutionStatus } from '../types/inventory';

// Extend the ControllerObject interface to include Mongoose document properties
export interface IController extends Omit<ControllerObject, '_id'>, Document {}

// Create the Controller schema
const ControllerSchema = new Schema<IController>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ['Tax Sale', 'Map', 'Property', 'Demographics'] },
  description: String,
  enabled: { type: Boolean, required: true, default: true },
  config: {
    schedule: {
      enabled: { type: Boolean, default: false },
      cronExpression: String,
      timezone: String
    },
    retryPolicy: {
      enabled: { type: Boolean, default: false },
      maxAttempts: Number,
      delayMs: Number,
      backoffMultiplier: Number
    },
    notificationSettings: {
      email: [String],
      slack: [String],
      webhook: [String],
      onSuccess: Boolean,
      onFailure: Boolean
    },
    filters: {
      objectTypes: [String],
      objectIds: [String],
      additionalFilters: Schema.Types.Mixed
    },
    parameters: Schema.Types.Mixed
  },
  lastRun: Date,
  nextScheduledRun: Date,
  executionHistory: [{
    id: { type: String, required: true },
    timestamp: { type: Date, required: true },
    status: { type: String, required: true, enum: ['Success', 'Failed', 'In Progress', 'Scheduled'] },
    duration: Number,
    error: String,
    result: Schema.Types.Mixed,
    metadata: {
      objectsProcessed: Number,
      objectsUpdated: Number,
      objectsFailed: Number,
      additionalInfo: Schema.Types.Mixed
    }
  }],
  attachedObjects: [{
    objectId: { type: String, required: true },
    objectType: { type: String, required: true },
    attachedAt: { type: Date, required: true },
    lastProcessed: Date
  }],
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
  metadata: {
    version: String,
    author: String,
    tags: [String],
    notes: [String]
  }
}, {
  timestamps: true
});

// Update the updatedAt timestamp before saving
ControllerSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes for common search fields
ControllerSchema.index({ type: 1 });
ControllerSchema.index({ enabled: 1 });
ControllerSchema.index({ 'config.schedule.enabled': 1 });
ControllerSchema.index({ 'attachedObjects.objectType': 1 });
ControllerSchema.index({ 'metadata.tags': 1 });

// Create and export the model
export const Controller = mongoose.model<IController>('Controller', ControllerSchema); 