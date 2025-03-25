# Interactive Map Components

This module provides dynamic, interactive mapping functionality for the Real Estate Platform's inventory module, turning geographical data into an engaging command center.

## Components

### MapComponent

The primary map component that displays geographical data for states, counties, and properties with rich visualizations and interactive elements.

```tsx
import { MapComponent } from '../maps';

// Example usage for a state with dark mode
<MapComponent 
  type="state"
  data={{
    geometry: stateGeojson,
    counties: stateCounties
  }}
  onSelect={handleCountySelect}
  darkMode={true}
/>

// Example usage for a county
<MapComponent 
  type="county"
  data={{
    geometry: countyGeojson,
    properties: countyProperties
  }}
  onSelect={handlePropertySelect}
/>

// Example usage for a property
<MapComponent 
  type="property"
  data={{
    geometry: propertyGeojson
  }}
/>
```

## Props

- `type`: The type of geographical entity being displayed ('us_map', 'state', 'county', 'property')
- `data`: The geographical data to display
- `onSelect`: Optional callback for when a geographical entity is selected
- `className`: Optional additional CSS class names
- `darkMode`: Optional boolean to toggle dark mode styling

## Features

### Vibrant Color Themes with Meaning
- Orange: New tax sales (0–7 days)
- Yellow: Recent tax sales (8–14 days)
- Blue: Verified / Active properties
- Red: Hot zones (dense or high-value properties)
- Gray: Dormant or inactive areas

### Interactive Elements
- **Pulsing Animations**: New and hot properties pulse to draw attention
- **Rich Popups**: Enhanced popups with property details and action buttons
- **Hover Tooltips**: Quick info preview on hover
- **Zooming Animations**: Smooth transitions when selecting areas
- **Timeline Controls**: Slider to view historical data changes
- **Dark Mode Support**: Toggle between light and dark themes

### Dashboard Integration
- **Stats Panel**: Quick overview of key metrics
- **Legend Panel**: Color and status explanations
- **Filter Chips**: Filter data by time period

## Implementation Notes

- Uses Leaflet for rendering maps
- Custom tile providers for better visual quality
- Responsive design with adjustments for different screen sizes
- Customizable styling based on entity type and status

## Dependencies

- Leaflet: For map rendering
- Bootstrap Icons: For UI elements
- React Bootstrap: For UI components

## Usage Instructions

### Preparing Data

For optimal visualization, enrich your geographical data with status information:

```tsx
// Example of enriching county data for visualization
counties.forEach(county => {
  county.geometry = {
    type: 'Feature',
    properties: {
      id: county.id,
      name: county.name,
      status: county.status, // 'new', 'recent', 'verified', 'hot', or 'dormant'
      lastUpdated: county.lastUpdated,
      value: county.value
    },
    geometry: county.originalGeometry
  };
});
```

### Customizing Appearance

You can customize the appearance by adding CSS classes:

```tsx
<MapComponent 
  type="county"
  className="large-map custom-border"
  ...
/>
```

## Future Enhancements

- Clustered markers for property density visualization
- Heatmap overlays for property values or lien concentrations
- Additional timeline animation features
- Social sharing of map views
- Advanced filtering capabilities
- Printable reports
- Mobile-specific interactions 