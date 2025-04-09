import mongoose, { Document, Schema } from 'mongoose';

export interface ICounty extends Document {
  name: string;                      // County name (required)
  stateId: mongoose.Types.ObjectId;  // Reference to State, using proper ObjectId type
  fips: string;                      // Federal Information Processing Standard code (required)
  boundaries: {                      // GeoJSON representation of county boundaries
    type: string;                    // "MultiPolygon"
    coordinates: any[];              // Nested array of coordinates
  };
  population: number;                // County population
  propertyCount: number;             // Number of properties in county
  
  // Consolidated statistics in a nested object
  stats: {
    medianHomeValue: number;         // Median home value in USD
    medianIncome: number;            // Median household income
    unemploymentRate: number;        // Unemployment rate percentage
    avgDaysOnMarket: number;         // Average days on market for listings
    listingCount: number;            // Number of active listings
    priceChangeYoY: number;          // Year-over-year price change percentage
    lastUpdated: Date;               // Last statistics update timestamp
  };
  
  createdAt: Date;                   // Document creation timestamp
  updatedAt: Date;                   // Document last update timestamp
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
    type: {
      type: String,
      enum: ['MultiPolygon'],
      default: 'MultiPolygon'
    },
    coordinates: {
      type: [[[Number]]], // Array of arrays of arrays of numbers
      default: [[[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]]
    }
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
    medianHomeValue: {
      type: Number,
      default: 0
    },
    medianIncome: {
      type: Number,
      default: 0
    },
    unemploymentRate: {
      type: Number,
      default: 0
    },
    avgDaysOnMarket: {
      type: Number,
      default: 0
    },
    listingCount: {
      type: Number,
      default: 0
    },
    priceChangeYoY: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true // Automatically create createdAt and updatedAt fields
});

// Middleware to update nested stats.lastUpdated timestamp when any stat field changes
CountySchema.pre('save', function(next) {
  const county = this as any;
  if (county.isModified('stats')) {
    county.stats.lastUpdated = new Date();
  }
  next();
});

// Create a compound index for efficient lookups and to prevent duplicates
CountySchema.index({ stateId: 1, name: 1 }, { unique: true });

// Create a geospatial index on boundaries for location-based queries
CountySchema.index({ "boundaries": "2dsphere" });

// Create index on commonly searched statistics fields
CountySchema.index({ "stats.medianHomeValue": 1 });
CountySchema.index({ "stats.lastUpdated": 1 });

export const County = mongoose.model<ICounty>('County', CountySchema); 