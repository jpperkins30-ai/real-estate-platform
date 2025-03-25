/**
 * State model - represents a US state
 */

import mongoose, { Schema, Document } from 'mongoose';
import { Geometry } from 'geojson';

export interface StateDocument extends Document {
  name: string;
  abbreviation: string;
  type: string;
  parentId: mongoose.Types.ObjectId;
  geometry: Geometry;
  metadata: {
    totalCounties: number;
    totalProperties: number;
    statistics: {
      totalTaxLiens: number;
      totalValue: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const StateSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    abbreviation: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      default: 'state',
      enum: ['state'],
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'USMap',
      required: true,
    },
    geometry: {
      type: Schema.Types.Mixed,
      required: false,
    },
    metadata: {
      totalCounties: {
        type: Number,
        default: 0,
      },
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
    },
  },
  {
    timestamps: true,
  }
);

// Create indices
StateSchema.index({ parentId: 1 });
StateSchema.index({ type: 1 });

export default mongoose.model<StateDocument>('State', StateSchema); 