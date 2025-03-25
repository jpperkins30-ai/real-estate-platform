import mongoose, { Schema, Document } from 'mongoose';
import { USMapObject, USMapMetadata, USMapStatistics } from '../types/inventory';

// Extend the USMapObject interface to include Mongoose document properties
export interface IUSMap extends USMapObject, Document {}

// Create the US Map schema
const USMapSchema = new Schema<IUSMap>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, required: true, default: 'us_map' },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
  metadata: {
    totalStates: { type: Number, required: true, default: 0 },
    totalCounties: { type: Number, required: true, default: 0 },
    totalProperties: { type: Number, required: true, default: 0 },
    statistics: {
      totalTaxLiens: { type: Number, required: true, default: 0 },
      totalValue: { type: Number, required: true, default: 0 },
      averagePropertyValue: { type: Number },
      totalPropertiesWithLiens: { type: Number },
      lastUpdated: { type: Date, required: true, default: Date.now }
    }
  },
  controllers: [{
    controllerId: { type: String, required: true },
    controllerType: { type: String, required: true },
    enabled: { type: Boolean, required: true },
    lastRun: { type: Date },
    nextScheduledRun: { type: Date },
    configuration: { type: Schema.Types.Mixed }
  }],
  states: [{ type: Schema.Types.ObjectId, ref: 'State' }]
}, {
  timestamps: true
});

// Update the updatedAt timestamp before saving
USMapSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create and export the model
export const USMap = mongoose.model<IUSMap>('USMap', USMapSchema); 