import mongoose, { Document, Schema } from 'mongoose';

export interface ICounty extends Document {
  name: string;
  stateId: mongoose.Types.ObjectId;
  fips: string;
  boundaries?: any; // GeoJSON object
  population?: number;
  medianIncome?: number;
  medianHomeValue?: number;
  unemploymentRate?: number;
  propertyCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const CountySchema = new Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  stateId: {
    type: Schema.Types.ObjectId,
    ref: 'State',
    required: true,
    index: true
  },
  fips: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  boundaries: {
    type: Schema.Types.Mixed,
    default: null
  },
  population: {
    type: Number,
    default: 0
  },
  medianIncome: {
    type: Number,
    default: 0
  },
  medianHomeValue: {
    type: Number,
    default: 0
  },
  unemploymentRate: {
    type: Number,
    default: 0
  },
  propertyCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to update timestamps
CountySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create a geospatial index on boundaries
CountySchema.index({ boundaries: '2dsphere' });

export const County = mongoose.model<ICounty>('County', CountySchema); 