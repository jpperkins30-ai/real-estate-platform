/**
 * County model - represents a US county within a state
 * Consolidated from County.ts and county.model.ts
 */

import mongoose, { Schema, Document } from 'mongoose';
import { geometrySchema, countyMetadataSchema, controllerSchema } from './geo-schemas';

// Interface for County document
export interface ICounty extends Document {
  customId: string; // Custom ID for the county
  name: string;
  type: string;
  parentId: mongoose.Types.ObjectId | string; // Reference to State ID
  stateId: mongoose.Types.ObjectId | string; // Reference to State ID
  stateAbbreviation?: string; // Added for quick reference
  geometry: {
    type: string;
    coordinates: any[];
  };
  metadata: {
    totalProperties: number;
    statistics: {
      totalTaxLiens: number;
      totalValue: number;
      averagePropertyValue?: number;
      totalPropertiesWithLiens?: number;
      lastUpdated?: Date;
    };
    searchConfig?: {
      enabled: boolean;
      searchUrl?: string;
      lookupMethod?: string;
      selectors?: {
        ownerName?: string;
        propertyAddress?: string;
        marketValue?: string;
        taxStatus?: string;
      };
      lienUrl?: string;
      lastRun?: Date;
      nextScheduledRun?: Date;
      searchCriteria?: any;
      notificationSettings?: any;
    };
    createdAt?: Date;
    updatedAt?: Date;
    lastModifiedBy?: string;
  };
  controllers?: Array<{
    controllerId: mongoose.Types.ObjectId;
    controllerType: string;
    enabled: boolean;
    lastRun?: Date;
    nextScheduledRun?: Date;
    configuration?: any;
  }>;
  properties?: mongoose.Types.ObjectId[];
  // Add standard Mongoose document fields
  createdAt: Date;
  updatedAt: Date;
  id?: string; // Virtual field that maps to customId
}

// Helper function to slugify a string (convert to URL-friendly format)
const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')         // Replace spaces with -
    .replace(/[^\w\-]+/g, '')     // Remove all non-word chars
    .replace(/\-\-+/g, '-')       // Replace multiple - with single -
    .replace(/^-+/, '')           // Trim - from start of text
    .replace(/-+$/, '');          // Trim - from end of text
};

// County Schema
const CountySchema = new Schema<ICounty>({
  // Custom ID field with easier readability and better handling
  customId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  name: { type: String, required: true },
  type: { type: String, default: 'county' },
  parentId: { 
    type: Schema.Types.Mixed, // Can be string or ObjectId
    required: true,
    ref: 'State'
  },
  stateId: { 
    type: Schema.Types.ObjectId, 
    ref: 'State', 
    required: true,
    index: true
  },
  stateAbbreviation: { 
    type: String, 
    uppercase: true,
    trim: true
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
    type: countyMetadataSchema,
    default: () => ({
      totalProperties: 0,
      statistics: {
        totalTaxLiens: 0,
        totalValue: 0
      },
      searchConfig: {
        enabled: false
      }
    })
  },
  controllers: [controllerSchema],
  properties: [{ type: Schema.Types.ObjectId, ref: 'Property' }]
}, {
  timestamps: true
});

// Create indexes for common search fields
CountySchema.index({ name: 1 });
CountySchema.index({ stateId: 1 });
CountySchema.index({ 'metadata.totalProperties': 1 });

// Create a compound index for efficient lookups and to prevent duplicates
CountySchema.index({ stateId: 1, name: 1 }, { unique: true });

// Create a 2dsphere index for geospatial queries
CountySchema.index({ "geometry": "2dsphere" });

// Add a virtual for 'id' that returns customId for API compatibility
CountySchema.virtual('id').get(function() {
  return this.customId;
});

// Ensure virtuals are included when converting to JSON/Object
CountySchema.set('toJSON', { 
  virtuals: true,
  transform: (doc, ret) => {
    // Include the virtual 'id' field
    // Remove the MongoDB _id and __v fields from responses
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});
CountySchema.set('toObject', { virtuals: true });

// Generate ID from name and state reference
CountySchema.pre('save', async function(next) {
  try {
    // Update timestamps
    this.set('updatedAt', new Date());
    
    // If customId is not set, generate it from state abbreviation and county name
    if (!this.customId) {
      // If we have stateAbbreviation, use it to generate customId
      if (this.stateAbbreviation) {
        this.customId = `${this.stateAbbreviation.toLowerCase()}-${slugify(this.name)}`;
      } 
      // If we have stateId but no stateAbbreviation, try to get the state
      else if (this.stateId) {
        try {
          const State = mongoose.model('State');
          const state = await State.findById(this.stateId);
          if (state) {
            this.stateAbbreviation = state.abbreviation;
            this.customId = `${state.abbreviation.toLowerCase()}-${slugify(this.name)}`;
          } else {
            // If state not found, use stateId as fallback in the customId
            this.customId = `state-${this.stateId.toString()}-${slugify(this.name)}`;
          }
        } catch (err) {
          // If error occurs, use a fallback id format
          this.customId = `county-${slugify(this.name)}-${Date.now()}`;
        }
      } else {
        // If neither stateId nor stateAbbreviation, use name and timestamp
        this.customId = `county-${slugify(this.name)}-${Date.now()}`;
      }
    }
    
    // If stateAbbreviation is provided but stateId is not, try to find the state
    if (this.stateAbbreviation && !this.stateId) {
      const State = mongoose.model('State');
      const state = await State.findOne({ abbreviation: this.stateAbbreviation });
      if (state) {
        this.stateId = state._id;
        this.parentId = state.id || state._id;
      }
    }
    
    // If we have a stateId but no stateAbbreviation, try to get it
    if (this.stateId && !this.stateAbbreviation) {
      try {
        const State = mongoose.model('State');
        const state = await State.findById(this.stateId);
        if (state) {
          this.stateAbbreviation = state.abbreviation;
        }
      } catch (err) {
        // Continue even if we can't get the state abbreviation
      }
    }
    
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Create and export the model
export const County = mongoose.models.County || mongoose.model<ICounty>('County', CountySchema);

// Default export for compatibility
export default County; 