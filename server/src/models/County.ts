/**
 * County model - represents a county within a US state
 */

import mongoose, { Schema, Document } from 'mongoose';
import { Geometry } from 'geojson';

export interface CountyDocument extends Document {
  name: string;
  type: string;
  parentId: mongoose.Types.ObjectId;
  stateId: mongoose.Types.ObjectId;
  geometry: Geometry;
  metadata: {
    totalProperties: number;
    statistics: {
      totalTaxLiens: number;
      totalValue: number;
    };
    searchConfig: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CountySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      default: 'county',
      enum: ['county'],
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'State',
      required: true,
    },
    stateId: {
      type: Schema.Types.ObjectId,
      ref: 'State',
      required: true,
    },
    geometry: {
      type: Schema.Types.Mixed,
      required: false,
    },
    metadata: {
      totalProperties: {
        type: Number,
        default: 0,
      },
      statistics: {
        totalTaxLiens: {
          type: Number,
          default: 0,
        },
        totalValue: {
          type: Number,
          default: 0,
        },
      },
      searchConfig: {
        type: Schema.Types.Mixed,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index on name and stateId for uniqueness within a state
CountySchema.index({ name: 1, stateId: 1 }, { unique: true });

// Create indices for common queries
CountySchema.index({ parentId: 1 });
CountySchema.index({ stateId: 1 });
CountySchema.index({ type: 1 });

export default mongoose.model<CountyDocument>('County', CountySchema); 