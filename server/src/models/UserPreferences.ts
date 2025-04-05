import mongoose, { Document, Schema } from 'mongoose';

export interface IUserPreferences extends Document {
  userId: mongoose.Types.ObjectId;
  defaultLayout: mongoose.Types.ObjectId;
  panelPreferences: Map<string, any>;
  themePreferences: {
    colorMode: 'light' | 'dark' | 'system';
    mapStyle: 'standard' | 'satellite' | 'terrain';
    accentColor?: string;
    fontSize?: 'small' | 'medium' | 'large';
  };
  filterPreferences: {
    defaultFilters: any;
    showFilterPanel: boolean;
    applyFiltersAutomatically: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserPreferencesSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  defaultLayout: {
    type: Schema.Types.ObjectId,
    ref: 'LayoutConfig'
  },
  panelPreferences: {
    type: Map,
    of: Schema.Types.Mixed
  },
  themePreferences: {
    colorMode: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    mapStyle: {
      type: String,
      enum: ['standard', 'satellite', 'terrain'],
      default: 'standard'
    },
    accentColor: String,
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium'
    }
  },
  filterPreferences: {
    defaultFilters: Schema.Types.Mixed,
    showFilterPanel: {
      type: Boolean,
      default: true
    },
    applyFiltersAutomatically: {
      type: Boolean,
      default: true
    }
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
UserPreferencesSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const UserPreferences = mongoose.model<IUserPreferences>('UserPreferences', UserPreferencesSchema); 