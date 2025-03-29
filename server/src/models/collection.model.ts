import mongoose, { Schema } from 'mongoose';
import { CollectionDocument } from '../types/inventory';

const ErrorLogEntrySchema = new Schema({
  message: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  stackTrace: String
}, { _id: false });

const CollectionStatsSchema = new Schema({
  duration: { type: Number, required: true },
  itemCount: { type: Number, required: true },
  successCount: { type: Number, required: true },
  errorCount: { type: Number, required: true },
  memoryUsage: Number
}, { _id: false });

const CollectionSchema = new Schema<CollectionDocument>({
  sourceId: { type: Schema.Types.ObjectId, required: true, ref: 'DataSource' },
  timestamp: { type: Date, required: true, default: Date.now },
  status: { 
    type: String, 
    required: true, 
    enum: ['success', 'partial', 'error'],
    default: 'success'
  },
  stats: CollectionStatsSchema,
  errorLog: [ErrorLogEntrySchema],
  properties: [{ type: Schema.Types.ObjectId, ref: 'Property' }]
}, {
  timestamps: true
});

// Create indexes for common search fields
CollectionSchema.index({ sourceId: 1 });
CollectionSchema.index({ timestamp: 1 });
CollectionSchema.index({ status: 1 });
CollectionSchema.index({ 'stats.successCount': 1 });
CollectionSchema.index({ 'stats.errorCount': 1 });

// Create a compound index for sourceId and timestamp
CollectionSchema.index({ "sourceId": 1, "timestamp": -1 });

// Create and export the model
export const Collection = mongoose.model<CollectionDocument>('Collection', CollectionSchema); 