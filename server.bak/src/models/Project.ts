import mongoose, { Schema, Document } from 'mongoose';

const ProjectSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  parentProject: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    index: true
  },
  properties: [{
    type: Schema.Types.ObjectId,
    ref: 'Property'
  }],
  filters: Schema.Types.Mixed,
  settings: Schema.Types.Mixed
}, {
  timestamps: true
});

// Create indexes for efficient queries
ProjectSchema.index({ owner: 1, parentProject: 1 });
ProjectSchema.index({ 'filters.state': 1, 'filters.county': 1 });

export interface ProjectDocument extends Document {
  name: string;
  description?: string;
  owner: mongoose.Types.ObjectId;
  parentProject?: mongoose.Types.ObjectId;
  properties: mongoose.Types.ObjectId[];
  filters?: any;
  settings?: any;
  createdAt: Date;
  updatedAt: Date;
}

const Project = mongoose.model<ProjectDocument>('Project', ProjectSchema);

export default Project; 