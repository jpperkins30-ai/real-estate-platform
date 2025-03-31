# Interactive Map Component Documentation

> **Note**: This document is part of the Real Estate Platform's technical documentation suite. For related guides, see:
> - [Architecture Guide](../../../docs/architecture.md) - Learn how the Map Component fits into the overall system architecture
> - [Development Guide](../../../docs/development-guide.md) - Setup instructions and development workflows
> - [Component Testing Guide](../../../docs/component-test-guide.md) - Testing procedures for components

## Overview
The enhanced MapComponent transforms geographical data visualization into a dynamic command center for the Real Estate Investment Platform. It provides a rich, interactive experience for exploring state, county, and property data with meaningful visual cues and real-time interaction.

## Features

### 1. Semantic Color Themes
- **Orange**: New tax sales (0-7 days old)
- **Yellow**: Recent tax sales (8-14 days old)
- **Blue**: Verified/active properties or areas
- **Red**: Hot zones (high-value or urgent properties)
- **Gray**: Dormant or inactive areas

### 2. Rich Interactivity
- **Pulsing Animations**: New and hot items pulse to draw attention
- **Zoom Animations**: Smooth transitions when selecting locations
- **Rich Popups**: Enhanced data display with action buttons
- **Hover Tooltips**: Quick information preview without clicking

### 3. UI Controls
- **Timeline Slider**: Scrub through historical data (0-90 days)
- **Stats Panel**: Quick overview of key metrics
- **Legend Panel**: Color and status explanations
- **Filter Chips**: Filter data by time period (7d/14d/30d/all)
- **Dark/Light Mode Toggle**: Switch between color schemes

### 4. Responsive Design
- Adapts to different screen sizes
- Mobile-friendly controls
- Optimized layouts for smaller devices

## Implementation Details

### Component Architecture
The MapComponent is built using React and Leaflet with custom controls:

```
MapComponent
├─ TimelineControl (slider for historical data)
├─ LegendControl (explains color meanings)
├─ StatsControl (displays metrics dashboard)
└─ Map layers (GeoJSON for boundaries, markers for properties)
```

### Type System
The component uses TypeScript with the following key types:

```typescript
interface MapComponentProps {
  type: 'us_map' | 'state' | 'county' | 'property';
  data?: any;
  onSelect?: (id: string) => void;
  className?: string;
  darkMode?: boolean;
}

interface MapFeature {
  id: string;
  name?: string;
  status?: 'new' | 'recent' | 'verified' | 'hot' | 'dormant';
  lastUpdated?: Date;
  value?: number;
}
```

### GeoJSON Structure
The component expects GeoJSON data with enhanced properties:

```javascript
{
  type: 'Feature',
  properties: {
    id: 'feature-id',
    name: 'Feature Name',
    status: 'verified', // or 'new', 'recent', 'hot', 'dormant'
    lastUpdated: Date.toISOString(),
    value: 350000 // numeric value for metrics
  },
  geometry: {
    // Standard GeoJSON geometry
  }
}
```

## Usage Examples

### State Level View
```jsx
<MapComponent 
  type="state"
  data={{
    geometry: stateGeojson,
    counties: stateCountiesArray
  }}
  onSelect={handleCountySelect}
  darkMode={isDarkMode}
/>
```

### County Level View
```jsx
<MapComponent 
  type="county"
  data={{
    geometry: countyGeojson,
    properties: propertyArray
  }}
  onSelect={handlePropertySelect}
  darkMode={isDarkMode}
/>
```

### Property Level View
```jsx
<MapComponent 
  type="property"
  data={{
    geometry: propertyGeojson,
    properties: [property]
  }}
  darkMode={isDarkMode}
/>
```

## Data Preparation

To get the most out of the enhanced visualization features, prepare your data as follows:

### Adding Status Information
```javascript
// Example: Enhancing county data for visualization
counties.forEach(county => {
  // Add status based on your business logic
  if (isNewTaxSale(county)) {
    county.metadata.status = 'new';
    county.metadata.lastUpdated = new Date();
  } else if (isHotZone(county)) {
    county.metadata.status = 'hot';
  } else {
    county.metadata.status = 'verified';
  }

  // Enhance geometry for map component
  county.geometry = {
    type: 'Feature',
    properties: {
      id: county.id,
      name: county.name,
      status: county.metadata.status,
      lastUpdated: county.metadata.lastUpdated || county.updatedAt,
      value: county.metadata.statistics?.totalValue || 0
    },
    geometry: county.originalGeometry
  };
});
```

## CSS Customization

The component includes extensive CSS classes for customization:

- `.map-container`: Base container class
- `.map-type-[type]`: Type-specific styling (state/county/property)
- `.dark-mode`: Dark theme styling
- `.custom-popup`: Popup styling
- `.marker-pin.[status]`: Status-colored markers
- `.pulse-animation`: Pulsing effect for highlighted items

## Custom Controls

### Timeline Control
Allows users to view historical data changes over time with a sliding range from 0-90 days.

### Legend Control
Displays the meaning of color coding with interactive tooltips.

### Stats Control
Shows key metrics with filtering options:
- Total items
- New items
- Hot zones
- Average value

## Best Practices

1. **Performance**: For large datasets, consider server-side filtering before sending to the map
2. **Status Assignment**: Implement clear business logic for assigning statuses
3. **Interaction**: Implement meaningful callbacks for the `onSelect` handler
4. **Mobile Support**: Test on various screen sizes and ensure responsive behavior

## Troubleshooting

### Common Issues

1. **Map not rendering**: Check if the container has a defined height
2. **Markers misplaced**: Ensure coordinates are in the correct format [longitude, latitude]
3. **GeoJSON not displaying**: Verify GeoJSON is valid and has the expected structure
4. **Icons missing**: Make sure the Leaflet CSS is properly imported

### TypeScript Errors

1. **Missing GeoJSON types**: Add appropriate type definitions or use the included namespace
2. **Property status errors**: Make sure to extend types to include the new status property

## Browser Compatibility

- Chrome, Firefox, Safari, Edge: Full support
- IE11: Not supported
- Mobile browsers: Supported with responsive design

## Dependencies

- React 18+
- Leaflet 1.9.4+
- React-Bootstrap (for UI components)
- Bootstrap Icons (for UI elements)

## Future Enhancements

- Clustered markers for high-density areas
- Heatmap overlays for property values
- Advanced filtering by property attributes
- Timeline animation playback
- Export to PDF/image
- Sharing capabilities

## Backup and Version Control

The map component implementation is backed up in the following locations:

1. GitHub repository: `real-estate-platform`
2. Documentation: This file and README.md
3. Type definitions: leaflet-types.ts

## License and Credits

- Uses Leaflet under BSD-2-Clause license
- Map tiles from Carto under CC-BY license
- Icons from Bootstrap Icons under MIT license

## Collector Framework Integration

The MapComponent integrates with the collector framework to display real-time updates from various data sources:

### Automatic Updates
- New properties from collectors appear with pulsing orange markers
- Status updates trigger visual transitions
- Collection progress is reflected in the stats panel

### Collection Filtering
```jsx
<MapComponent 
  type="county"
  data={{
    geometry: countyGeojson,
    properties: propertyArray
  }}
  collectionFilters={{
    sourceId: 'tax-sale-collector',
    timeRange: '7d',
    status: ['new', 'verified']
  }}
  onSelect={handlePropertySelect}
/>
```

### Collection Events
The component listens for collection events to update its display:
- `onCollectionStart`: Displays collection area highlight
- `onCollectionProgress`: Updates progress indicators
- `onCollectionComplete`: Refreshes data and updates stats

### Performance Considerations
- Implements lazy loading for large collection results
- Uses WebSocket updates for real-time collection progress
- Caches collection results for improved performance 

## Security Considerations

> **Note**: For a complete overview of security measures and best practices, see the [main security guide](../../../../docs/SECURITY.md).

### Data Security
- All sensitive property data is encrypted in transit
- User permissions are validated before displaying restricted information
- Property details are filtered based on user role

### API Security
- All API requests use secure HTTPS connections
- Authentication tokens are required for protected endpoints
- Rate limiting is applied to prevent abuse

### User Input
- All user inputs are sanitized before processing
- Map bounds are validated to prevent invalid requests
- File uploads are restricted to allowed types and sizes 