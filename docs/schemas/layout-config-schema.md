# MongoDB Schema - Panel Layout Configurations

## Overview

This schema defines the structure for storing panel layout configurations in MongoDB. The schema supports saving user-specific or global layout configurations that can be loaded later.

## Schema Definition

```javascript
const LayoutConfigSchema = new mongoose.Schema({
  // Unique identifier for the layout configuration
  layoutId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // User ID if this is a user-specific layout
  userId: {
    type: String,
    index: true,
    sparse: true  // Index is sparse because not all layouts are user-specific
  },
  
  // Is this a global layout template?
  isGlobal: {
    type: Boolean,
    default: false
  },
  
  // Display name for the layout
  name: {
    type: String,
    required: true
  },
  
  // Description of the layout
  description: {
    type: String
  },
  
  // Layout type
  layoutType: {
    type: String,
    enum: ['single', 'dual', 'tri', 'quad', 'custom'],
    required: true
  },
  
  // Panel configurations
  panels: {
    type: Map,
    of: {
      // Panel ID
      id: {
        type: String,
        required: true
      },
      
      // Content type
      contentType: {
        type: String,
        required: true
      },
      
      // Panel title
      title: {
        type: String,
        required: true
      },
      
      // Panel position
      position: {
        row: {
          type: Number,
          default: 0
        },
        col: {
          type: Number,
          default: 0
        }
      },
      
      // Panel size
      size: {
        width: {
          type: Number,
          default: 1
        },
        height: {
          type: Number,
          default: 1
        }
      },
      
      // Panel state (stored as JSON)
      state: {
        type: mongoose.Schema.Types.Mixed
      },
      
      // Panel visibility
      visible: {
        type: Boolean,
        default: true
      },
      
      // Panel is minimized
      minimized: {
        type: Boolean,
        default: false
      },
      
      // Panel is maximized
      maximized: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // Layout tags for filtering
  tags: {
    type: [String],
    default: []
  },
  
  // Custom configuration (stored as JSON)
  customConfig: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true  // Automatically manage createdAt and updatedAt
});

// Indexes
LayoutConfigSchema.index({ userId: 1, name: 1 }, { unique: true, sparse: true });  // Each user can have uniquely named layouts
LayoutConfigSchema.index({ isGlobal: 1, name: 1 }, { unique: true, sparse: true });  // Global layouts must have unique names
LayoutConfigSchema.index({ tags: 1 });  // Index tags for filtering

// Create the model
const LayoutConfig = mongoose.model('LayoutConfig', LayoutConfigSchema);
```

## Example Document

```javascript
{
  "_id": ObjectId("5f7b5d3e9d3e6a2b7c8b4567"),
  "layoutId": "user_123_county_analysis",
  "userId": "user_123",
  "isGlobal": false,
  "name": "County Analysis Layout",
  "description": "Layout for analyzing county data with map, stats, and property panels",
  "layoutType": "tri",
  "panels": {
    "map-panel": {
      "id": "map-panel",
      "contentType": "map",
      "title": "County Map",
      "position": { "row": 0, "col": 0 },
      "size": { "width": 2, "height": 1 },
      "state": {
        "center": [37.7749, -122.4194],
        "zoom": 6,
        "layers": ["counties", "properties"]
      },
      "visible": true,
      "minimized": false,
      "maximized": false
    },
    "county-panel": {
      "id": "county-panel",
      "contentType": "county",
      "title": "County Details",
      "position": { "row": 0, "col": 2 },
      "size": { "width": 1, "height": 1 },
      "state": {
        "selectedCounty": "06075"
      },
      "visible": true,
      "minimized": false,
      "maximized": false
    },
    "stats-panel": {
      "id": "stats-panel",
      "contentType": "stats",
      "title": "County Statistics",
      "position": { "row": 1, "col": 0 },
      "size": { "width": 3, "height": 1 },
      "state": {
        "metrics": ["population", "properties", "land_value"],
        "chartType": "bar"
      },
      "visible": true,
      "minimized": false,
      "maximized": false
    }
  },
  "tags": ["analysis", "counties", "california"],
  "customConfig": {
    "theme": "light",
    "refreshInterval": 300000
  },
  "createdAt": ISODate("2023-10-15T14:22:30.123Z"),
  "updatedAt": ISODate("2023-11-20T09:45:12.456Z")
} 
```

## API Usage Examples

### Saving a Layout Configuration

```javascript
const saveLayoutConfig = async (userId, name, layoutType, panels, options = {}) => {
  const layoutId = `user_${userId}_${name.toLowerCase().replace(/\s+/g, '_')}`;
  
  const layoutConfig = new LayoutConfig({
    layoutId,
    userId,
    name,
    layoutType,
    panels,
    description: options.description || '',
    tags: options.tags || [],
    customConfig: options.customConfig || {}
  });
  
  await layoutConfig.save();
  return layoutId;
};
```

### Loading a Layout Configuration

```javascript
const loadLayoutConfig = async (layoutId) => {
  const layoutConfig = await LayoutConfig.findOne({ layoutId });
  
  if (!layoutConfig) {
    throw new Error(`Layout configuration not found: ${layoutId}`);
  }
  
  return {
    layoutType: layoutConfig.layoutType,
    panels: layoutConfig.panels.toObject(),
    customConfig: layoutConfig.customConfig
  };
};
```

### Finding User Layouts

```javascript
const getUserLayouts = async (userId) => {
  return await LayoutConfig.find({ userId })
    .select('layoutId name description layoutType tags updatedAt')
    .sort({ updatedAt: -1 });
};
```

### Finding Layouts by Tags

```javascript
const getLayoutsByTags = async (tags, options = {}) => {
  const query = { tags: { $all: tags } };
  
  if (options.userId) {
    query.userId = options.userId;
  }
  
  if (options.isGlobal !== undefined) {
    query.isGlobal = options.isGlobal;
  }
  
  return await LayoutConfig.find(query)
    .select('layoutId name description layoutType tags updatedAt userId isGlobal')
    .sort({ updatedAt: -1 });
};