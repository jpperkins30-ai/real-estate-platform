# Map Component Upgrade Guide

This guide explains how to upgrade existing map implementations to use the enhanced interactive features.

## Upgrade Steps

### 1. Update Component Props

Existing map implementations need to be updated to use the new props:

```diff
 <MapComponent 
   type="county"
   data={countyData}
   onSelect={handleCountySelect}
+  darkMode={isDarkMode}
 />
```

### 2. Enhance Data Model

Add status properties to your data objects:

```javascript
// Example for enhancing county data
county.metadata.status = determineStatus(county); // 'new', 'recent', 'verified', 'hot', or 'dormant'
county.metadata.lastUpdated = new Date(); // When the status was last changed

// Example function to determine status
function determineStatus(county) {
  const daysSinceUpdate = getDaysSince(county.updatedAt);
  
  if (daysSinceUpdate <= 7) return 'new';
  if (daysSinceUpdate <= 14) return 'recent';
  if (isHighValue(county)) return 'hot';
  if (isActive(county)) return 'verified';
  return 'dormant';
}
```

### 3. Prepare GeoJSON Structure

Update your GeoJSON data to include the required properties:

```javascript
// Convert your existing geometry to enhanced GeoJSON
const enhancedGeometry = {
  type: 'Feature',
  properties: {
    id: entity.id,
    name: entity.name,
    status: entity.metadata.status || 'verified',
    lastUpdated: entity.metadata.lastUpdated || entity.updatedAt,
    value: entity.metadata.statistics?.totalValue || 0
  },
  geometry: entity.geometry
};
```

### 4. Add Dark Mode Toggle

Implement a dark mode toggle in your parent component:

```jsx
const [darkMode, setDarkMode] = useState(false);

// In your JSX
<Form.Check 
  type="switch"
  id="dark-mode-switch"
  label="Dark Mode"
  checked={darkMode}
  onChange={(e) => setDarkMode(e.target.checked)}
/>

// Pass to map component
<MapComponent 
  // other props
  darkMode={darkMode}
/>
```

### 5. Update CSS Imports

Ensure you're importing the updated CSS:

```diff
 import MapComponent from '../../maps/MapComponent';
+import '../../maps/MapComponent.css';
```

## New Features to Leverage

### Interactive Controls

The map now provides several built-in controls:

1. **Timeline Slider**: Shows historical data changes
2. **Legend Panel**: Explains color meanings
3. **Stats Panel**: Shows quick metrics dashboard
4. **Filter Chips**: Quick time period filters

### Rich Interactions

New interaction features include:

1. **Pulsing Animations**: Automatic highlighting for new and hot items
2. **Enhanced Popups**: Rich data display with action buttons
3. **Zoom Animations**: Smooth transitions when selecting entities
4. **Hover Tooltips**: Quick data preview

## Breaking Changes

1. **GeoJSON Structure**: The component now expects Feature objects with properties
2. **Status Property**: Data objects need status properties for visualization
3. **CSS Classes**: Some CSS class names have changed

## Compatibility

This update is compatible with:

- React 18+
- TypeScript 5.0+
- Vite 5.1+
- Modern browsers (Chrome, Firefox, Safari, Edge)

## Performance Considerations

For large datasets:

1. **Limit Data Points**: Consider limiting to 500 points for optimal performance
2. **Server-side Filtering**: Filter data on the server before sending to the client
3. **Pagination**: Implement pagination for large property sets

## Troubleshooting

If you encounter issues after upgrading:

1. **Map Not Rendering**: Check if the container has a defined height
2. **Colors Not Showing**: Verify data has status properties set correctly
3. **TypeScript Errors**: Ensure you're using the latest type definitions

## Need Help?

If you need assistance with the upgrade:

1. Check the full documentation in `DOCUMENTATION.md`
2. Review examples in `README.md`
3. Contact the development team for support 