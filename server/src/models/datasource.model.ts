import mongoose, { Schema, Document } from 'mongoose';

// Define the DataSource document interface
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
  metadata?: {
    lookupMethod?: 'account_number' | 'parcel_id';
    selectors?: any;
    lienUrl?: string;
    [key: string]: any;
  };
  status: 'active' | 'inactive' | 'error';
  lastCollected?: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

// For backward compatibility with code using IDataSource
export interface IDataSource extends DataSourceDocument {}

// Define the region schema
const RegionSchema = new Schema({
  state: {
    type: String,
    required: true,
    trim: true,
  },
  county: {
    type: String,
    trim: true,
  },
}, { _id: false });

// Define the schedule schema
const ScheduleSchema = new Schema({
  frequency: {
    type: String,
    required: true,
    enum: ['hourly', 'daily', 'weekly', 'monthly', 'manual'],
    default: 'manual',
  },
  dayOfWeek: {
    type: Number,
    min: 0,
    max: 6,
  },
  dayOfMonth: {
    type: Number,
    min: 1,
    max: 31,
  },
}, { _id: false });

// Define the metadata schema
const MetadataSchema = new Schema({
  lookupMethod: {
    type: String,
    enum: ['account_number', 'parcel_id'],
  },
  selectors: {
    type: Schema.Types.Mixed,
  },
  lienUrl: {
    type: String,
    trim: true,
  },
}, { _id: false, strict: false });

// Define the DataSource schema
const DataSourceSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['county-website', 'state-records', 'tax-database', 'api', 'pdf'],
  },
  url: {
    type: String,
    required: true,
    trim: true,
  },
  region: {
    type: RegionSchema,
    required: true,
  },
  collectorType: {
    type: String,
    required: true,
    trim: true,
  },
  schedule: {
    type: ScheduleSchema,
    default: () => ({
      frequency: 'manual'
    }),
  },
  metadata: {
    type: MetadataSchema,
    default: () => ({}),
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive', 'error'],
    default: 'inactive',
  },
  lastCollected: {
    type: Date,
  },
  errorMessage: {
    type: String,
  },
}, {
  timestamps: true,
});

// Create indexes for common search fields
DataSourceSchema.index({ name: 1 }, { unique: true });
DataSourceSchema.index({ type: 1 });
DataSourceSchema.index({ collectorType: 1 });
DataSourceSchema.index({ 'region.state': 1, 'region.county': 1 });
DataSourceSchema.index({ status: 1 });

// Create and export the model
export const DataSource = mongoose.model<DataSourceDocument>('DataSource', DataSourceSchema);

// For backward compatibility with code using default export
export default DataSource; 