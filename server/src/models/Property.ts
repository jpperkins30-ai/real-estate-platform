import mongoose, { Document, Schema } from 'mongoose';

export interface IProperty extends Document {
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  propertyType: string;
  status: 'active' | 'pending' | 'sold' | 'off-market';
  listDate: Date;
  soldDate?: Date;
  countyId: mongoose.Types.ObjectId;
  description?: string;
  photos?: string[];
  features?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema({
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  zip: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    index: true
  },
  bedrooms: {
    type: Number,
    default: 0
  },
  bathrooms: {
    type: Number,
    default: 0
  },
  squareFeet: {
    type: Number,
    default: 0
  },
  propertyType: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'sold', 'off-market'],
    default: 'active',
    index: true
  },
  listDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  soldDate: {
    type: Date,
    default: null
  },
  countyId: {
    type: Schema.Types.ObjectId,
    ref: 'County',
    required: true,
    index: true
  },
  description: {
    type: String
  },
  photos: {
    type: [String]
  },
  features: {
    type: [String]
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
PropertySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Add compound indexes for common queries
PropertySchema.index({ countyId: 1, status: 1 });
PropertySchema.index({ countyId: 1, propertyType: 1 });
PropertySchema.index({ countyId: 1, price: 1 });

export const Property = mongoose.model<IProperty>('Property', PropertySchema); 