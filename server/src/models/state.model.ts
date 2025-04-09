/**
 * State model - represents a US state in the geographic hierarchy
 * Consolidated from State.ts and state.model.ts
 */

import mongoose, { Schema, Document } from 'mongoose';
import { geometrySchema, controllerSchema } from './geo-schemas';

// Interface for State document
export interface IState extends Document {
  id: string;                        // Custom ID field (lowercase state abbreviation)
  name: string;                      // State name (required)
  abbreviation: string;              // State abbreviation (required)
  type: string;                      // Entity type (default: 'state')
  parentId: mongoose.Types.ObjectId; // Reference to USMap
  geometry: {                        // GeoJSON representation of state boundaries
    type: string;                    // "MultiPolygon"
    coordinates: any[];              // Nested array of coordinates
  };
  totalCounties: number;             // Number of counties in this state
  totalProperties: number;           // Number of properties in this state
  
  // Consolidated statistics in a nested object
  stats: {
    medianHomeValue: number;         // Median home value in USD
    medianIncome: number;            // Median household income
    unemploymentRate: number;        // Unemployment rate percentage
    totalTaxLiens: number;           // Total tax liens in this state
    totalValue: number;              // Total property value in USD
    averagePropertyValue: number;    // Average property value in USD
    lastUpdated: Date;               // Last statistics update timestamp
  };
  
  // Geographic information
  regionalInfo: {
    region: string;                  // Geographic region (e.g., "Northeast")
    subregion: string;               // Geographic subregion (e.g., "Mid-Atlantic")
  };
  
  // Related documents
  counties: mongoose.Types.ObjectId[];  // References to County documents
  properties: mongoose.Types.ObjectId[]; // References to Property documents
  
  // Controller configuration
  controllers?: Array<{
    controllerId: mongoose.Types.ObjectId;
    controllerType: string;
    enabled: boolean;
    lastRun?: Date;
    nextScheduledRun?: Date;
    configuration?: any;
  }>;
  
  // Document timestamps
  createdAt: Date;                   // Document creation timestamp
  updatedAt: Date;                   // Document last update timestamp
}

// State Schema
const StateSchema = new Schema<IState>({
  // Custom string ID field (lowercase state abbreviation)
  id: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  name: { 
    type: String, 
    required: true 
  },
  abbreviation: { 
    type: String, 
    required: true, 
    uppercase: true, 
    trim: true, 
    index: true 
  },
  type: { 
    type: String, 
    default: 'state' 
  },
  parentId: { 
    type: Schema.Types.ObjectId, 
    required: true, 
    ref: 'USMap'
  },
  geometry: { 
    type: geometrySchema,
    required: true,
    default: () => ({
      type: 'MultiPolygon',
      coordinates: [[[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]]
    })
  },
  totalCounties: {
    type: Number,
    default: 0
  },
  totalProperties: {
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
    totalTaxLiens: {
      type: Number,
      default: 0
    },
    totalValue: {
      type: Number,
      default: 0
    },
    averagePropertyValue: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  regionalInfo: {
    region: { 
      type: String,
      default: ''
    },
    subregion: { 
      type: String,
      default: ''
    }
  },
  controllers: [controllerSchema],
  counties: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'County' 
  }],
  properties: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Property' 
  }]
}, {
  timestamps: true
});

// Create indexes for common search fields
StateSchema.index({ name: 1 }, { unique: true });
StateSchema.index({ abbreviation: 1 }, { unique: true });
StateSchema.index({ totalProperties: 1 });
StateSchema.index({ 'stats.medianHomeValue': 1 });
StateSchema.index({ 'stats.lastUpdated': 1 });

// Create a 2dsphere index for geospatial queries
StateSchema.index({ "geometry": "2dsphere" });

// Create a compound index for efficient lookups
StateSchema.index({ name: 1, abbreviation: 1 }, { unique: true });

// Middleware to update nested stats.lastUpdated timestamp when any stat field changes
StateSchema.pre('save', function(next) {
  // Generate slug-based ID from abbreviation if not provided
  if (!this.id && this.abbreviation) {
    this.id = this.abbreviation.toLowerCase();
  }
  
  // Update stats.lastUpdated when any stat is modified
  const state = this as any;
  if (state.isModified('stats')) {
    state.stats.lastUpdated = new Date();
  }
  
  next();
});

// Make sure virtuals are included in JSON output
StateSchema.set('toJSON', { 
  virtuals: true,
  transform: (doc, ret) => {
    // Ensure id is always the custom id field, not MongoDB _id
    ret.id = doc.id;
    // Remove MongoDB _id for cleaner API responses
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});
StateSchema.set('toObject', { virtuals: true });

// Create and export the model
export const State = mongoose.models.State || mongoose.model<IState>('State', StateSchema);

// Default export for backward compatibility
export default State; 