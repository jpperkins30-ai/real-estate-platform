import mongoose, { Document, Schema } from 'mongoose';

export interface PanelPosition {
  row: number;
  col: number;
}

export interface PanelSize {
  width: number;
  height: number;
}

export interface PanelConfig {
  id: string;
  contentType: string;
  title: string;
  position?: PanelPosition;
  size?: PanelSize;
  state?: any;
  visible?: boolean;
}

export interface ILayoutConfig extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  isDefault: boolean;
  isPublic: boolean;
  layoutType: 'single' | 'dual' | 'tri' | 'quad';
  panels: PanelConfig[];
  createdAt: Date;
  updatedAt: Date;
}

const LayoutConfigSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  isDefault: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  layoutType: {
    type: String,
    enum: ['single', 'dual', 'tri', 'quad'],
    required: true
  },
  panels: [{
    id: {
      type: String,
      required: true
    },
    contentType: {
      type: String,
      required: true
    },
    title: String,
    position: {
      row: Number,
      col: Number
    },
    size: {
      width: Number,
      height: Number
    },
    state: Schema.Types.Mixed,
    visible: {
      type: Boolean,
      default: true
    }
  }],
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
LayoutConfigSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const LayoutConfig = mongoose.model<ILayoutConfig>('LayoutConfig', LayoutConfigSchema); 