import mongoose, { Schema, Document } from 'mongoose';
import { CountyObject, CountyMetadata, CountyStatistics, CountyGeometry, CountySearchConfig } from '../types/inventory';

// Extend the CountyObject interface to include Mongoose document properties
export interface ICounty extends Omit<CountyObject, '_id'>, Document {}

// Create the County schema
const CountySchema = new Schema<ICounty>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, required: true, default: 'county' },
  parentId: { type: String, required: true },  // Reference to State Object
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
  geometry: {
    type: { type: String, required: true, enum: ['Polygon', 'MultiPolygon'] },
    coordinates: { type: [[[Number]]], required: true }
  },
  metadata: {
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
  properties: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
  searchConfig: {
    enabled: { type: Boolean, required: true, default: false },
    lastRun: { type: Date },
    nextScheduledRun: { type: Date },
    searchCriteria: {
      propertyTypes: [String],
      minValue: Number,
      maxValue: Number,
      minSquareFeet: Number,
      maxSquareFeet: Number,
      minBedrooms: Number,
      maxBedrooms: Number,
      minBathrooms: Number,
      maxBathrooms: Number,
      minYearBuilt: Number,
      maxYearBuilt: Number,
      minLotSize: Number,
      maxLotSize: Number,
      propertyConditions: [String],
      additionalFilters: Schema.Types.Mixed
    },
    notificationSettings: {
      email: [String],
      slack: [String],
      webhook: [String]
    }
  }
}, {
  timestamps: true
});

// Update the updatedAt timestamp before saving
CountySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create and export the model
export const County = mongoose.model<ICounty>('County', CountySchema); 