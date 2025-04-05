import mongoose, { Document, Schema } from 'mongoose';

export interface CountyStats {
  medianHomePrice: number;
  avgDaysOnMarket: number;
  listingCount: number;
  priceChangeYoY: number;
  lastUpdated: Date;
}

export interface ICounty extends Document {
  stateId: string;
  name: string;
  fips: string;
  boundaries: any; // GeoJSON
  population: number;
  propertyCount: number;
  stats: CountyStats;
  createdAt: Date;
  updatedAt: Date;
}

const CountySchema = new Schema({
  stateId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  fips: {
    type: String,
    required: true,
    unique: true
  },
  boundaries: {
    type: Schema.Types.Mixed,
    required: true
  },
  population: {
    type: Number,
    default: 0
  },
  propertyCount: {
    type: Number,
    default: 0
  },
  stats: {
    medianHomePrice: Number,
    avgDaysOnMarket: Number,
    listingCount: Number,
    priceChangeYoY: Number,
    lastUpdated: {
      type: Date,
      default: Date.now
    }
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

// Indexes for optimization
CountySchema.index({ stateId: 1, name: 1 });

export const County = mongoose.model<ICounty>('County', CountySchema); 