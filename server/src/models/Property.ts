import mongoose, { Document, Schema } from 'mongoose';

export interface IProperty extends Document {
  address: string;                      // Street address (required)
  city: string;                         // City name (required)
  state: string;                        // State abbreviation (required)
  zip: string;                          // ZIP code (required)
  price: number;                        // Property price in USD (required)
  bedrooms: number;                     // Number of bedrooms
  bathrooms: number;                    // Number of bathrooms
  squareFeet: number;                   // Property size in square feet
  propertyType: string;                 // Type of property (e.g., 'single-family', 'condo')
  status: 'active' | 'pending' | 'sold' | 'off-market'; // Listing status
  listDate: Date;                       // Date property was listed
  soldDate?: Date;                      // Date property was sold (if applicable)
  
  // References to related documents
  countyId: mongoose.Types.ObjectId;    // Reference to County document
  stateId: mongoose.Types.ObjectId;     // Reference to State document
  
  // Property details
  description?: string;                 // Property description
  photos?: string[];                    // Array of photo URLs
  features?: string[];                  // Array of property features/amenities
  
  // Statistics and metrics in a nested object
  stats: {
    daysOnMarket: number;               // Number of days property has been listed
    viewCount: number;                  // Number of times property listing has been viewed
    savedCount: number;                 // Number of users who saved this property
    priceHistory: Array<{               // History of price changes
      date: Date;                       // Date of price change
      price: number;                    // Price amount
      change: number;                   // Amount changed from previous price
    }>;
    compareValue: number;               // Comparative market value
    lastUpdated: Date;                  // Last statistics update timestamp
  };
  
  // Standard timestamps
  createdAt: Date;                      // Document creation timestamp
  updatedAt: Date;                      // Document last update timestamp
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
  stateId: {
    type: Schema.Types.ObjectId,
    ref: 'State',
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
  stats: {
    daysOnMarket: {
      type: Number,
      default: 0
    },
    viewCount: {
      type: Number,
      default: 0
    },
    savedCount: {
      type: Number,
      default: 0
    },
    priceHistory: [{
      date: {
        type: Date,
        default: Date.now
      },
      price: {
        type: Number,
        required: true
      },
      change: {
        type: Number,
        default: 0
      },
      _id: false
    }],
    compareValue: {
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

// Middleware to update stats.lastUpdated when any stat field changes
PropertySchema.pre('save', function(next) {
  const property = this as any;
  
  // Update the stats.lastUpdated timestamp when any stats field is modified
  if (property.isModified('stats')) {
    property.stats.lastUpdated = new Date();
  }
  
  // Update days on market for active listings
  if (property.status === 'active' && property.listDate) {
    const listDate = new Date(property.listDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - listDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    property.stats.daysOnMarket = diffDays;
  }
  
  // Initialize price history if adding initial price and history is empty
  if (property.isNew && property.price && (!property.stats.priceHistory || property.stats.priceHistory.length === 0)) {
    if (!property.stats.priceHistory) {
      property.stats.priceHistory = [];
    }
    property.stats.priceHistory.push({
      date: new Date(),
      price: property.price,
      change: 0
    });
  }
  
  next();
});

// Add compound indexes for common queries
PropertySchema.index({ countyId: 1, status: 1 });
PropertySchema.index({ countyId: 1, propertyType: 1 });
PropertySchema.index({ countyId: 1, price: 1 });
PropertySchema.index({ stateId: 1, status: 1 });
PropertySchema.index({ stateId: 1, countyId: 1 });
PropertySchema.index({ 'stats.daysOnMarket': 1 });
PropertySchema.index({ 'stats.viewCount': 1 });

export const Property = mongoose.model<IProperty>('Property', PropertySchema); 