/**
 * USMap model - represents the root geographic entity for the United States
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface USMapDocument extends Document {
  name: string;
  type: string;
  metadata: {
    totalStates: number;
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

const USMapSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      default: 'US Map',
    },
    type: {
      type: String,
      required: true,
      default: 'us_map',
      enum: ['us_map'],
    },
    metadata: {
      totalStates: {
        type: Number,
        default: 0,
      },
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

// Create index on type
USMapSchema.index({ type: 1 });

export default mongoose.model<USMapDocument>('USMap', USMapSchema); 