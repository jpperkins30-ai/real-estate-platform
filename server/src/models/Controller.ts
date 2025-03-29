/**
 * Controller model - represents a data collection controller
 */

import mongoose, { Schema, Document } from 'mongoose';

// Define the Controller interface
export interface IController extends Document {
  name: string;
  type: string;
  controllerType: string;
  description: string;
  configTemplate: {
    requiredFields: string[];
    optionalFields: any;
  };
  attachedTo: Array<{
    objectId: mongoose.Types.ObjectId;
    objectType: string;
  }>;
  implementation: {
    collectorType: string;
    supportedSourceTypes: string[];
    additionalConfig: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Create the Controller schema
const ControllerSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, default: 'controller' },
  controllerType: { 
    type: String, 
    required: true, 
    enum: ['Tax Sale', 'Map', 'Property', 'Demographics'] 
  },
  description: { type: String, required: true },
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
  }
}, {
  timestamps: true
});

// Create indexes for common search fields
ControllerSchema.index({ name: 1 });
ControllerSchema.index({ controllerType: 1 });
ControllerSchema.index({ 'implementation.collectorType': 1 });

// Create a compound index for attachedTo queries
ControllerSchema.index({ "attachedTo.objectType": 1, "attachedTo.objectId": 1 });

// Create and export the model
export const Controller = mongoose.models.Controller || mongoose.model<IController>('Controller', ControllerSchema); 