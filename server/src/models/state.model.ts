import mongoose, { Schema, Document } from 'mongoose';
import { StateObject, StateMetadata, StateStatistics, StateGeometry } from '../types/inventory';

// Extend the StateObject interface to include Mongoose document properties
export interface IState extends Omit<StateObject, '_id'>, Document {}

// Create the State schema
const StateSchema = new Schema<IState>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  abbreviation: { type: String, required: true },
  type: { type: String, required: true, default: 'state' },
  parentId: { type: String, required: true },  // Reference to US Map Object
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
  geometry: {
    type: { type: String, required: true, enum: ['Polygon', 'MultiPolygon'] },
    coordinates: { type: [[[Number]]], required: true }
  },
  metadata: {
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
  counties: [{ type: Schema.Types.ObjectId, ref: 'County' }]
}, {
  timestamps: true
});

// Update the updatedAt timestamp before saving
StateSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create and export the model
export const State = mongoose.model<IState>('State', StateSchema); 