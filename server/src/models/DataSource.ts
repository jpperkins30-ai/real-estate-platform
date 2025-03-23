import mongoose, { Schema, Document } from 'mongoose';

const RegionSchema = new Schema({
  state: {
    type: String,
    required: true
  },
  county: String
}, { _id: false });

const ScheduleSchema = new Schema({
  frequency: {
    type: String,
    enum: ['hourly', 'daily', 'weekly', 'monthly', 'manual'],
    default: 'manual'
  },
  dayOfWeek: {
    type: Number,
    min: 0,
    max: 6
  },
  dayOfMonth: {
    type: Number,
    min: 1,
    max: 31
  }
}, { _id: false });

const DataSourceSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['county-website', 'state-records', 'tax-database', 'api', 'pdf'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  region: {
    type: RegionSchema,
    required: true
  },
  collectorType: {
    type: String,
    required: true
  },
  schedule: {
    type: ScheduleSchema,
    default: () => ({
      frequency: 'manual'
    })
  },
  metadata: Schema.Types.Mixed,
  lastCollected: Date,
  status: {
    type: String,
    enum: ['active', 'inactive', 'error'],
    default: 'active'
  },
  errorMessage: String
}, {
  timestamps: true
});

// Create indexes for efficient queries
DataSourceSchema.index({ 'region.state': 1, 'region.county': 1 });
DataSourceSchema.index({ status: 1 });
DataSourceSchema.index({ collectorType: 1 });

export interface DataSourceDocument extends Document {
  name: string;
  type: 'county-website' | 'state-records' | 'tax-database' | 'api' | 'pdf';
  url: string;
  region: {
    state: string;
    county?: string;
  };
  collectorType: string;
  schedule: {
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'manual';
    dayOfWeek?: number;
    dayOfMonth?: number;
  };
  metadata?: any;
  lastCollected?: Date;
  status: 'active' | 'inactive' | 'error';
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DataSource = mongoose.model<DataSourceDocument>('DataSource', DataSourceSchema);

export default DataSource; 