# US Map Component Documentation

## Overview

The US Map component is a core visualization tool within the Real Estate Platform that provides an interactive geographic interface for managing and viewing real estate data across the United States. It serves as the primary navigation and data visualization layer for the inventory hierarchy.

## Purpose

The US Map component addresses several key needs:

1. **Geographic Navigation**: Provides intuitive navigation through the state → county → property hierarchy
2. **Data Visualization**: Displays geographic data and property information on an interactive map
3. **Spatial Analysis**: Enables spatial queries and analysis of real estate data
4. **Integration**: Connects with the inventory module and controller system

## Technical Implementation

### Component Structure

The US Map component is implemented with the following structure:

```
USMap/
├── index.tsx                 # Main map component
├── components/              # Sub-components
│   ├── StateLayer.tsx       # State boundary rendering
│   ├── CountyLayer.tsx      # County boundary rendering
│   ├── PropertyLayer.tsx    # Property point rendering
│   ├── Controls.tsx         # Map controls (zoom, pan, etc.)
│   └── Tooltips.tsx         # Interactive tooltips
├── hooks/                   # Custom hooks
│   ├── useMapState.ts       # Map state management
│   ├── useGeoData.ts        # Geographic data handling
│   └── useInteractions.ts   # User interaction handling
└── utils/                   # Utility functions
    ├── geoProcessing.ts     # Geographic data processing
    ├── styleUtils.ts        # Map styling utilities
    └── projectionUtils.ts   # Map projection utilities
```

### Core Features

1. **Interactive Layers**
   - State boundaries with hover effects
   - County boundaries with selection capability
   - Property markers with clustering
   - Custom overlays for data visualization

2. **Data Integration**
   - Real-time data updates from controllers
   - Property search integration
   - Geographic data processing
   - Spatial query support

3. **User Interface**
   - Zoom and pan controls
   - Layer toggles
   - Search integration
   - Custom tooltips

## Code Example

Here's a simplified example of the main map component:

```tsx
const USMap: React.FC = () => {
  const [mapState, setMapState] = useState({
    center: [-98.5795, 39.8283], // US center
    zoom: 4,
    selectedState: null,
    selectedCounty: null
  });

  const { geoData, loading } = useGeoData();
  const { handleStateClick, handleCountyClick } = useInteractions();

  return (
    <MapContainer
      center={mapState.center}
      zoom={mapState.zoom}
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {!loading && (
        <>
          <StateLayer
            data={geoData.states}
            onStateClick={handleStateClick}
            selectedState={mapState.selectedState}
          />
          
          {mapState.selectedState && (
            <CountyLayer
              data={geoData.counties}
              stateId={mapState.selectedState}
              onCountyClick={handleCountyClick}
              selectedCounty={mapState.selectedCounty}
            />
          )}
          
          {mapState.selectedCounty && (
            <PropertyLayer
              countyId={mapState.selectedCounty}
              data={geoData.properties}
            />
          )}
        </>
      )}
      
      <Controls />
      <Tooltips />
    </MapContainer>
  );
};
```

## Geographic Data Management

The US Map component handles geographic data through several key processes:

### 1. Data Loading

```typescript
const useGeoData = () => {
  const [geoData, setGeoData] = useState({
    states: null,
    counties: null,
    properties: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGeoData = async () => {
      try {
        const [states, counties] = await Promise.all([
          loadStatesGeoJSON(),
          loadCountiesGeoJSON()
        ]);
        
        setGeoData({
          states: processGeoJSON(states),
          counties: processGeoJSON(counties),
          properties: null
        });
      } catch (error) {
        console.error('Error loading geographic data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGeoData();
  }, []);

  return { geoData, loading };
};
```

### 2. Data Processing

The component processes geographic data to:
- Optimize rendering performance
- Handle coordinate transformations
- Manage data updates
- Support spatial queries

### 3. State Management

Manages map state including:
- Current viewport
- Selected entities
- Layer visibility
- User interactions

## Integration with Inventory Module

The US Map component integrates with the Inventory Module in several ways:

1. **Data Flow**
   - Receives geographic data from the inventory module
   - Updates property information in real-time
   - Syncs selection state with inventory views

2. **Navigation**
   - Provides geographic navigation to inventory items
   - Maintains selection state across components
   - Supports deep linking to specific locations

3. **Controller Integration**
   - Displays controller coverage areas
   - Shows data collection status
   - Supports controller configuration

## User Interface

The US Map component provides a rich user interface with:

1. **Interactive Controls**
   - Zoom and pan
   - Layer toggles
   - Search integration
   - Custom tooltips

2. **Visual Feedback**
   - Hover effects
   - Selection highlighting
   - Loading states
   - Error handling

3. **Responsive Design**
   - Adapts to screen size
   - Supports touch interactions
   - Maintains performance at scale

## API Integration

The component interacts with the following API endpoints:

- `GET /api/geo/states`: Get state boundaries
- `GET /api/geo/counties`: Get county boundaries
- `GET /api/geo/properties`: Get property locations
- `GET /api/geo/search`: Spatial search endpoint
- `GET /api/geo/controllers`: Get controller coverage

## Performance Optimization

The component implements several performance optimizations:

1. **Data Loading**
   - Progressive loading of geographic data
   - Caching of frequently accessed data
   - Compression of GeoJSON data

2. **Rendering**
   - Layer-based rendering
   - Clustering for dense data
   - Viewport-based filtering

3. **Interaction**
   - Debounced event handlers
   - Efficient state updates
   - Optimized re-renders

## Future Enhancements

1. **Advanced Visualization**
   - 3D terrain support
   - Custom map styles
   - Advanced clustering options

2. **Analysis Tools**
   - Heat maps
   - Density analysis
   - Custom overlays

3. **Integration Features**
   - External data source support
   - Custom layer support
   - Advanced search capabilities 