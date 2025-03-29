/**
 * Controller model - represents a data collection controller
 * Consolidated from Controller.ts and controller.model.ts
 */

// @ts-nocheck
import mongoose, { Schema, Document } from 'mongoose';
import { ControllerObject, ControllerType, ControllerExecutionStatus } from '../types/inventory';

// Define the Controller interface
export interface IController extends Omit<ControllerObject, '_id'>, Document {
  name: string;
  type: string;
  controllerType: string;
  description: string;
  configTemplate?: {
    requiredFields: string[];
    optionalFields: any;
  };
  enabled: boolean;
  attachedTo?: Array<{
    objectId: mongoose.Types.ObjectId;
    objectType: string;
  }>;
  implementation?: {
    collectorType: string;
    supportedSourceTypes: string[];
    additionalConfig: any;
  };
  config?: {
    schedule: {
      enabled: boolean;
      cronExpression?: string;
      timezone?: string;
    };
    retryPolicy: {
      enabled: boolean;
      maxAttempts?: number;
      delayMs?: number;
      backoffMultiplier?: number;
    };
    notificationSettings: {
      email?: string[];
      slack?: string[];
      webhook?: string[];
      onSuccess?: boolean;
      onFailure?: boolean;
    };
    filters: {
      objectTypes?: string[];
      objectIds?: string[];
      additionalFilters?: any;
    };
    parameters?: any;
  };
  lastRun?: Date;
  nextScheduledRun?: Date;
  executionHistory?: [{
    id: string;
    timestamp: Date;
    status: string;
    duration?: number;
    error?: string;
    result?: any;
    metadata?: {
      objectsProcessed?: number;
      objectsUpdated?: number;
      objectsFailed?: number;
      additionalInfo?: any;
    };
  }];
  attachedObjects?: [{
    objectId: string;
    objectType: string;
    attachedAt: Date;
    lastProcessed?: Date;
  }];
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    version?: string;
    author?: string;
    tags?: string[];
    notes?: string[];
  };
}

// Create the Controller schema
const ControllerSchema = new Schema<IController>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, required: true, default: 'controller' },
  controllerType: { 
    type: String, 
    required: true, 
    enum: ['Tax Sale', 'Map', 'Property', 'Demographics'] 
  },
  description: { type: String, required: true },
  enabled: { type: Boolean, required: true, default: true },
  configTemplate: {
    requiredFields: [{ type: String }],
    optionalFields: Schema.Types.Mixed
  },
  attachedTo: [{
    objectId: { type: Schema.Types.ObjectId, required: true },
    objectType: { 
      type: String, 
      required: true, 
      enum: ['us_map', 'state', 'county', 'property'] 
    }
  }],
  implementation: {
    collectorType: { type: String, required: true },
    supportedSourceTypes: [{ type: String }],
    additionalConfig: Schema.Types.Mixed
  },
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
ControllerSchema.index({ name: 1 });
ControllerSchema.index({ type: 1 });
ControllerSchema.index({ controllerType: 1 });
ControllerSchema.index({ enabled: 1 });
ControllerSchema.index({ 'implementation.collectorType': 1 });
ControllerSchema.index({ 'config.schedule.enabled': 1 });
ControllerSchema.index({ 'attachedObjects.objectType': 1 });
ControllerSchema.index({ 'metadata.tags': 1 });

// Create a compound index for attachedTo queries
ControllerSchema.index({ "attachedTo.objectType": 1, "attachedTo.objectId": 1 });

// Create and export the model
export const Controller = mongoose.models.Controller || mongoose.model<IController>('Controller', ControllerSchema);

// Default export for backward compatibility
export default Controller; 