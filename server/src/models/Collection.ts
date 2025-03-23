import mongoose, { Schema, Document } from 'mongoose';

const ErrorLogEntrySchema = new Schema({
  message: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  stackTrace: String
}, { _id: false });

const CollectionStatsSchema = new Schema({
  duration: Number, // in milliseconds
  itemCount: Number,
  successCount: Number,
  errorCount: Number,
  memoryUsage: Number
}, { _id: false });

const CollectionSchema = new Schema({
  sourceId: {
    type: Schema.Types.ObjectId,
    ref: 'DataSource',
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  status: {
    type: String,
    enum: ['success', 'partial', 'error'],
    default: 'success',
    index: true
  },
  stats: {
    type: CollectionStatsSchema,
    default: () => ({
      duration: 0,
      itemCount: 0,
      successCount: 0,
      errorCount: 0,
      memoryUsage: 0
    })
  },
  errorLog: [ErrorLogEntrySchema],
  properties: [{
    type: Schema.Types.ObjectId,
    ref: 'Property'
  }]
}, {
  timestamps: true
});

// Create compound indexes for efficient queries
CollectionSchema.index({ sourceId: 1, timestamp: -1 });
CollectionSchema.index({ status: 1, timestamp: -1 });

export interface CollectionDocument extends Document {
  sourceId: mongoose.Types.ObjectId;
  timestamp: Date;
  status: 'success' | 'partial' | 'error';
  stats: {
    duration: number;
    itemCount: number;
    successCount?: number;
    errorCount?: number;
    memoryUsage?: number;
  };
  errorLog?: Array<{
    message: string;
    timestamp: Date;
    stackTrace?: string;
  }>;
  properties: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const Collection = mongoose.model<CollectionDocument>('Collection', CollectionSchema);

export default Collection; 