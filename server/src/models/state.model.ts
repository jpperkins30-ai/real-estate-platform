/**
 * State model - represents a US state in the geographic hierarchy
 */

import mongoose, { Schema, Document } from 'mongoose';
import { geometrySchema, stateMetadataSchema, controllerSchema } from './geo-schemas';

// Interface for State document
export interface IState extends Document {
  id: string; // Custom ID field (lowercase state abbreviation)
  name: string;
  abbreviation: string;
  type: string;
  parentId: mongoose.Types.ObjectId | string;
  geometry: {
    type: string;
    coordinates: any[];
  };
  metadata: {
    regionalInfo?: {
      region?: string;
      subregion?: string;
    };
    totalCounties: number;
    totalProperties: number;
    statistics: {
      totalTaxLiens: number;
      totalValue: number;
      lastUpdated?: Date;
    };
    createdAt?: Date;
    updatedAt?: Date;
    lastModifiedBy?: string;
  };
  controllers?: Array<any>;
  counties?: mongoose.Types.ObjectId[];
  properties?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
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
  name: { type: String, required: true },
  abbreviation: { type: String, required: true, uppercase: true, trim: true, index: true },
  type: { type: String, default: 'state' },
  parentId: { 
    type: Schema.Types.Mixed, // Can be string or ObjectId
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
  metadata: { 
    type: stateMetadataSchema,
    default: () => ({})
  },
  controllers: [controllerSchema],
  counties: [{ type: Schema.Types.ObjectId, ref: 'County' }],
  properties: [{ type: Schema.Types.ObjectId, ref: 'Property' }]
}, {
  timestamps: true
});

// Create a compound index for efficient lookups
StateSchema.index({ name: 1, abbreviation: 1 }, { unique: true });

// Generate slug-based ID from abbreviation if not provided
StateSchema.pre('save', function(next) {
  // Ensure the ID is set to lowercase state abbreviation if not provided
  if (!this.id && this.abbreviation) {
    this.id = this.abbreviation.toLowerCase();
  }
  
  // Set updatedAt timestamp
  this.set('updatedAt', new Date());
  next();
});

// Remove the conflicting _id virtual
// StateSchema.virtual('_id').get(function() {
//   return this._id;
// });

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

// Default export for compatibility
export default State; 