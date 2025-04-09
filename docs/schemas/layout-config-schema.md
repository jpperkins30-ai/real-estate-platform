# MongoDB Schema - Panel Layout Configurations

## Overview

This schema defines the structure for storing panel layout configurations in MongoDB. The schema supports saving user-specific layout configurations that can be loaded later.

## Schema Definition

```javascript
// Setup MongoDB schema for layouts
const setupLayoutSchema = () => {
  // Only create schema if it doesn't already exist
  if (mongoose.models.Layout) {
    return mongoose.models.Layout;
  }
  
  const PanelPositionSchema = new mongoose.Schema({
    // For standard layouts
    row: { type: Number },
    col: { type: Number },
    // For advanced layouts
    x: { type: Number },
    y: { type: Number },
    width: { type: Number },
    height: { type: Number }
  }, { _id: false });
  
  const PanelSizeSchema = new mongoose.Schema({
    width: { type: Number },
    height: { type: Number }
  }, { _id: false });
  
  const PanelSchema = new mongoose.Schema({
    id: { type: String, required: true },
    contentType: { 
      type: String, 
      enum: ['map', 'state', 'county', 'property', 'filter', 'stats', 'chart'],
      required: true 
    },
    title: { type: String, required: true },
    position: PanelPositionSchema,
    size: PanelSizeSchema,
    state: { type: mongoose.Schema.Types.Mixed },
    visible: { type: Boolean, default: true },
    closable: { type: Boolean, default: false },
    maximizable: { type: Boolean, default: true }
  }, { _id: false });
  
  const layoutSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    type: { 
      type: String, 
      enum: ['single', 'dual', 'tri', 'quad', 'advanced'],
      required: true 
    },
    panels: [PanelSchema],
    isDefault: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
  
  // Middleware to update the updatedAt field on save
  layoutSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
  });
  
  // Create indexes for more efficient queries
  layoutSchema.index({ userId: 1 });
  layoutSchema.index({ isPublic: 1 });
  layoutSchema.index({ type: 1 });
  
  return mongoose.model('Layout', layoutSchema);
};
```

## Example Document

```javascript
{
  "_id": ObjectId("5f7b5d3e9d3e6a2b7c8b4567"),
  "name": "County Analysis Layout",
  "description": "Layout for analyzing county data with map, stats, and property panels",
  "type": "tri",
  "userId": ObjectId("5f7a4d2c8b9d1a3e5c7b4568"),
  "panels": [
    {
      "id": "map-panel",
      "contentType": "map",
      "title": "County Map",
      "position": { "row": 0, "col": 0 },
      "size": { "width": 50, "height": 50 },
      "state": {
        "center": [37.7749, -122.4194],
        "zoom": 6,
        "layers": ["counties", "properties"]
      },
      "visible": true,
      "closable": false,
      "maximizable": true
    },
    {
      "id": "county-panel",
      "contentType": "county",
      "title": "County Details",
      "position": { "row": 0, "col": 1 },
      "size": { "width": 50, "height": 50 },
      "state": {
        "selectedCounty": "06075"
      },
      "visible": true,
      "closable": false,
      "maximizable": true
    },
    {
      "id": "stats-panel",
      "contentType": "stats",
      "title": "County Statistics",
      "position": { "row": 1, "col": 0 },
      "size": { "width": 100, "height": 50 },
      "state": {
        "metrics": ["population", "properties", "land_value"],
        "chartType": "bar"
      },
      "visible": true,
      "closable": false,
      "maximizable": true
    }
  ],
  "isDefault": false,
  "isPublic": true,
  "createdAt": ISODate("2023-10-15T14:22:30.123Z"),
  "updatedAt": ISODate("2023-11-20T09:45:12.456Z")
}
```

## API Usage Examples

### Saving a Layout Configuration

```javascript
const saveLayout = async (name, layoutType, panels, options = {}) => {
  const layout = new Layout({
    name,
    type: layoutType,
    panels,
    description: options.description || '',
    isDefault: options.isDefault || false,
    isPublic: options.isPublic || false,
    userId: options.userId
  });
  
  await layout.save();
  return layout._id;
};
```

### Loading a Layout Configuration

```javascript
const loadLayout = async (layoutId) => {
  const layout = await Layout.findById(layoutId);
  
  if (!layout) {
    throw new Error(`Layout configuration not found: ${layoutId}`);
  }
  
  return {
    type: layout.type,
    panels: layout.panels,
    name: layout.name,
    description: layout.description
  };
};
```

### Finding User Layouts

```javascript
const getUserLayouts = async (userId) => {
  return await Layout.find({ userId })
    .select('_id name description type panels createdAt updatedAt')
    .sort({ updatedAt: -1 });
};
```

### Finding Public Layouts

```javascript
const getPublicLayouts = async () => {
  return await Layout.find({ isPublic: true })
    .select('_id name description type createdAt updatedAt')
    .sort({ updatedAt: -1 });
};