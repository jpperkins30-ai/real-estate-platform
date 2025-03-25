import mongoose, { Schema, Document } from 'mongoose';
import { PropertyObject, PropertyStatus, PropertyType, PropertyCondition } from '../types/inventory';

// Extend the PropertyObject interface to include Mongoose document properties
export interface IProperty extends Omit<PropertyObject, '_id'>, Document {}

// Create the Property schema
const PropertySchema = new Schema<IProperty>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, required: true, default: 'property' },
  parentId: { type: String, required: true },  // Reference to County Object
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
  status: { type: String, required: true, enum: ['Active', 'Pending', 'Sold', 'Foreclosed', 'Tax Lien'] },
  location: {
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      county: { type: String, required: true }
    },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    parcelId: String,
    legalDescription: String
  },
  features: {
    type: { type: String, required: true, enum: ['Single Family', 'Multi Family', 'Commercial', 'Industrial', 'Land', 'Other'] },
    condition: { type: String, required: true, enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Unknown'] },
    yearBuilt: Number,
    squareFeet: Number,
    lotSize: Number,
    bedrooms: Number,
    bathrooms: Number,
    stories: Number,
    garage: Number,
    pool: Boolean,
    additionalFeatures: [String]
  },
  taxStatus: {
    assessedValue: { type: Number, required: true },
    marketValue: { type: Number, required: true },
    lastAssessmentDate: { type: Date, required: true },
    taxRate: { type: Number, required: true },
    annualTaxAmount: { type: Number, required: true },
    taxLienAmount: Number,
    taxLienDate: Date,
    taxLienStatus: { type: String, enum: ['Active', 'Paid', 'Foreclosed'] },
    lastPaymentDate: Date,
    nextPaymentDue: Date,
    paymentHistory: [{
      date: { type: Date, required: true },
      amount: { type: Number, required: true },
      type: { type: String, required: true, enum: ['Regular', 'Lien', 'Penalty'] },
      status: { type: String, required: true, enum: ['Paid', 'Pending', 'Failed'] }
    }],
    lastUpdated: { type: Date, required: true, default: Date.now }
  },
  controllers: [{
    controllerId: { type: String, required: true },
    controllerType: { type: String, required: true },
    enabled: { type: Boolean, required: true },
    lastRun: Date,
    nextScheduledRun: Date,
    configuration: { type: Schema.Types.Mixed }
  }],
  metadata: {
    lastInspected: Date,
    lastModified: Date,
    notes: [String],
    tags: [String]
  }
}, {
  timestamps: true
});

// Update the updatedAt timestamp before saving
PropertySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes for common search fields
PropertySchema.index({ 'location.address.state': 1 });
PropertySchema.index({ 'location.address.county': 1 });
PropertySchema.index({ 'features.type': 1 });
PropertySchema.index({ 'features.condition': 1 });
PropertySchema.index({ 'taxStatus.taxLienStatus': 1 });
PropertySchema.index({ 'metadata.tags': 1 });

// Create and export the model
export const Property = mongoose.model<IProperty>('Property', PropertySchema); 