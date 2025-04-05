import mongoose, { Schema, Document } from 'mongoose';

/**
 * Interface for a Panel within a Layout
 */
export interface IPanel extends Document {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  settings: Record<string, any>;
  dataSourceId?: mongoose.Types.ObjectId;
  title?: string;
  isVisible: boolean;
  zIndex?: number;
}

/**
 * Interface for the Layout document
 */
export interface ILayout extends Document {
  name: string;
  description?: string;
  userId: mongoose.Types.ObjectId;
  isDefault: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  panels: IPanel[];
  tags?: string[];
  thumbnail?: string;
  lastUsed?: Date;
  version: string;
  settings?: Record<string, any>;
}

const PanelSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    w: { type: Number, required: true },
    h: { type: Number, required: true }
  },
  settings: { type: Schema.Types.Mixed, default: {} },
  dataSourceId: { type: Schema.Types.ObjectId, ref: 'DataSource' },
  title: { type: String },
  isVisible: { type: Boolean, default: true },
  zIndex: { type: Number, default: 0 }
});

const LayoutSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isDefault: { type: Boolean, default: false },
  isPublic: { type: Boolean, default: false },
  panels: [PanelSchema],
  tags: [{ type: String }],
  thumbnail: { type: String },
  lastUsed: { type: Date },
  version: { type: String, default: '1.0.0' },
  settings: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

// Create indexes for better query performance
LayoutSchema.index({ userId: 1 });
LayoutSchema.index({ isPublic: 1 });
LayoutSchema.index({ tags: 1 });

// Create a compound index for finding a user's default layout
LayoutSchema.index({ userId: 1, isDefault: 1 });

export const Layout = mongoose.model<ILayout>('Layout', LayoutSchema); 