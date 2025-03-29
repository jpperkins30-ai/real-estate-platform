/**
 * State model - represents a US state
 */

import mongoose, { Schema, Document } from 'mongoose';

// Define the State document interface
export interface IState extends Document {
  name: string;
  abbreviation: string;
  type: string;
  parentId: mongoose.Types.ObjectId;
  geometry: {
    type: string;
    coordinates: any[][];
  };
  metadata: {
    totalCounties: number;
    totalProperties: number;
    statistics: {
      totalTaxLiens: number;
      totalValue: number;
    }
  };
  controllers: Array<{
    controllerId: mongoose.Types.ObjectId;
    controllerType: string;
    enabled: boolean;
    lastRun?: Date;
    nextScheduledRun?: Date;
    configuration?: any;
  }>;
  counties?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Create the State schema
const StateSchema = new Schema({
  name: { type: String, required: true },
  abbreviation: { type: String, required: true },
  type: { type: String, required: true, default: 'state' },
  parentId: { type: Schema.Types.ObjectId, required: true, ref: 'USMap' },
  geometry: {
    type: { type: String, enum: ['Polygon', 'MultiPolygon'], required: true },
    coordinates: { type: Array, required: true } // GeoJSON format
  },
  metadata: {
    totalCounties: { type: Number, default: 0, required: true },
    totalProperties: { type: Number, default: 0, required: true },
    statistics: {
      totalTaxLiens: { type: Number, default: 0, required: true },
      totalValue: { type: Number, default: 0, required: true }
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
  }],
  counties: [{ type: Schema.Types.ObjectId, ref: 'County' }]
}, {
  timestamps: true
});

// Create indexes for common search fields
StateSchema.index({ name: 1 }, { unique: true });
StateSchema.index({ abbreviation: 1 }, { unique: true });
StateSchema.index({ 'metadata.totalProperties': 1 });

// Create a 2dsphere index for geospatial queries
StateSchema.index({ "geometry": "2dsphere" });

// Create and export the model
export const State = mongoose.models.State || mongoose.model<IState>('State', StateSchema); 