import React, { useRef, useEffect, useState } from 'react';
// @ts-ignore - Using our local type definitions
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapComponent.css';

// Define types for GeoJSON since we're having issues with the @types/geojson package
namespace GeoJSON {
  export interface GeoJsonObject {
    type: string;
    bbox?: number[];
    coordinates?: any;
  }
  
  export interface Feature {
    type: "Feature";
    geometry: any;
    properties?: {
      id?: string;
      name?: string;
      status?: string;
      value?: number;
      lastUpdated?: string;
      [key: string]: any;
    };
  }
}

// Define types for map features
interface MapFeature {
  id: string;
  name?: string;
  status?: 'new' | 'recent' | 'verified' | 'hot' | 'dormant';
  lastUpdated?: Date;
  value?: number;
}

interface MapComponentProps {
  type: 'us_map' | 'state' | 'county' | 'property';
  data?: any;
  onSelect?: (id: string) => void;
  className?: string;
  darkMode?: boolean;
}

// Color themes based on status
const getColorByStatus = (status: string = 'verified', darkMode: boolean = false): string => {
  const colors: Record<string, string> = {
    new: '#FF9800', // Orange for new tax sales (0-7 days)
    recent: '#FFEB3B', // Yellow for recent (8-14 days)
    verified: '#2196F3', // Blue for verified/active
    hot: '#F44336', // Red for hot zones
    dormant: darkMode ? '#757575' : '#BDBDBD', // Gray for dormant/inactive
    default: darkMode ? '#3388ff' : '#3388ff'
  };
  return colors[status] || colors.default;
};

// Fix for marker icon paths issue in webpack/vite builds
const fixLeafletIcons = (): void => {
  // Fix marker icons
  const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
  const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

  // @ts-ignore - TS doesn't know about L.Icon.Default
  delete L.Icon.Default.prototype._getIconUrl;
  
  L.Icon.Default.mergeOptions({
    iconUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

// Custom map control for timeline slider
class TimelineControl extends L.Control {
  // Initialize property with default empty div 
  private _container: HTMLElement = document.createElement('div');
  private _onSlide: (value: number) => void;

  constructor(options: L.ControlOptions & { onSlide: (value: number) => void }) {
    super(options);
    this._onSlide = options.onSlide;
  }

  onAdd(map: L.Map): HTMLElement {
    this._container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-timeline-control');
    this._container.innerHTML = `
      <div class="timeline-slider-container">
        <label>History: </label>
        <input type="range" min="0" max="90" value="30" step="1" class="timeline-slider" />
        <span class="timeline-value">30 days</span>
      </div>
    `;
    
    const slider = this._container.querySelector('.timeline-slider') as HTMLInputElement;
    const valueDisplay = this._container.querySelector('.timeline-value') as HTMLElement;
    
    L.DomEvent.on(slider, 'input', (e: Event) => {
      const value = parseInt((e.target as HTMLInputElement).value);
      valueDisplay.textContent = `${value} days`;
      this._onSlide(value);
    });
    
    L.DomEvent.disableClickPropagation(this._container);
    
    return this._container;
  }

  onRemove(map: L.Map): void {
    L.DomEvent.off(this._container);
  }
}

// Legend control
class LegendControl extends L.Control {
  // Initialize property with default empty div
  private _container: HTMLElement = document.createElement('div');
  private _darkMode: boolean;

  constructor(options: L.ControlOptions & { darkMode: boolean }) {
    super(options);
    this._darkMode = options.darkMode;
  }

  onAdd(map: L.Map): HTMLElement {
    this._container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-legend-control');
    this.updateContent();
    return this._container;
  }

  updateContent() {
    this._container.innerHTML = `
      <div class="legend-container ${this._darkMode ? 'dark-mode' : ''}">
        <h4>Status Legend</h4>
        <div class="legend-item">
          <span class="color-box" style="background-color: ${getColorByStatus('new')}"></span>
          <span>New tax sales (0-7 days)</span>
        </div>
        <div class="legend-item">
          <span class="color-box" style="background-color: ${getColorByStatus('recent')}"></span>
          <span>Recent (8-14 days)</span>
        </div>
        <div class="legend-item">
          <span class="color-box" style="background-color: ${getColorByStatus('verified')}"></span>
          <span>Verified / Active</span>
        </div>
        <div class="legend-item">
          <span class="color-box" style="background-color: ${getColorByStatus('hot')}"></span>
          <span>Hot zones</span>
        </div>
        <div class="legend-item">
          <span class="color-box" style="background-color: ${getColorByStatus('dormant', this._darkMode)}"></span>
          <span>Dormant / Inactive</span>
        </div>
      </div>
    `;
    
    L.DomEvent.disableClickPropagation(this._container);
  }

  updateDarkMode(isDark: boolean) {
    this._darkMode = isDark;
    this.updateContent();
  }

  onRemove(map: L.Map): void {
    L.DomEvent.off(this._container);
  }
}

// Stats panel control
class StatsControl extends L.Control {
  // Initialize property with default empty div
  private _container: HTMLElement = document.createElement('div');
  private _stats: any;
  private _darkMode: boolean;

  constructor(options: L.ControlOptions & { stats: any, darkMode: boolean }) {
    super(options);
    this._stats = options.stats || {};
    this._darkMode = options.darkMode;
  }

  onAdd(map: L.Map): HTMLElement {
    this._container = L.DomUtil.create('div', 'leaflet-control leaflet-stats-control');
    this.updateContent();
    return this._container;
  }

  updateContent() {
    const { totalItems = 0, newItems = 0, hotZones = 0, averageValue = 0 } = this._stats;
    
    this._container.innerHTML = `
      <div class="stats-container ${this._darkMode ? 'dark-mode' : ''}">
        <h4>Quick Stats</h4>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">${totalItems}</div>
            <div class="stat-label">Total</div>
          </div>
          <div class="stat-item highlight">
            <div class="stat-value">${newItems}</div>
            <div class="stat-label">New</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${hotZones}</div>
            <div class="stat-label">Hot Zones</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">$${averageValue.toLocaleString()}</div>
            <div class="stat-label">Avg Value</div>
          </div>
        </div>
        <div class="filter-chips">
          <button class="chip active">7d</button>
          <button class="chip">14d</button>
          <button class="chip">30d</button>
          <button class="chip">All</button>
        </div>
      </div>
    `;
    
    L.DomEvent.disableClickPropagation(this._container);
    
    // Add event listeners to chips
    const chips = this._container.querySelectorAll('.chip');
    chips.forEach(chip => {
      L.DomEvent.on(chip, 'click', function() {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      });
    });
  }

  updateStats(stats: any) {
    this._stats = stats;
    this.updateContent();
  }

  updateDarkMode(isDark: boolean) {
    this._darkMode = isDark;
    this.updateContent();
  }

  onRemove(map: L.Map): void {
    L.DomEvent.off(this._container);
  }
}

// Dark mode style URL for map tiles
const DARK_TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const LIGHT_TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

const MapComponent: React.FC<MapComponentProps> = ({ 
  type, 
  data, 
  onSelect,
  className,
  darkMode = false
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geoLayerRef = useRef<L.GeoJSON | null>(null);
  const legendControlRef = useRef<LegendControl | null>(null);
  const statsControlRef = useRef<StatsControl | null>(null);
  
  const [timelineValue, setTimelineValue] = useState(30);
  
  useEffect(() => {
    // Fix marker icon paths
    fixLeafletIcons();
    
    if (!mapRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current, {
      zoomAnimation: true,
      fadeAnimation: true,
      markerZoomAnimation: true
    }).setView([37.8, -96], 4);
    
    mapInstanceRef.current = map;
    
    // Add base tile layer with proper attribution
    L.tileLayer(darkMode ? DARK_TILE_URL : LIGHT_TILE_URL, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);
    
    // Add timeline slider control
    const timelineControl = new TimelineControl({
      position: 'bottomleft',
      onSlide: (value: number) => {
        setTimelineValue(value);
        // In a real application, we'd update the data based on the timeline value
      }
    });
    map.addControl(timelineControl);
    
    // Add legend control
    const legendControl = new LegendControl({
      position: 'bottomright',
      darkMode
    });
    map.addControl(legendControl);
    legendControlRef.current = legendControl;
    
    // Add stats control - would be populated with real data in production
    const mockStats = {
      totalItems: type === 'state' ? 58 : (type === 'county' ? 3450 : 12500),
      newItems: type === 'state' ? 5 : (type === 'county' ? 124 : 320),
      hotZones: type === 'state' ? 3 : (type === 'county' ? 18 : 45),
      averageValue: type === 'state' ? 420000 : (type === 'county' ? 350000 : 275000)
    };
    
    const statsControl = new StatsControl({
      position: 'topright',
      stats: mockStats,
      darkMode
    });
    map.addControl(statsControl);
    statsControlRef.current = statsControl;
    
    // Add the mode toggle control
    const modeToggleControl = L.control({ position: 'topright' });
    modeToggleControl.onAdd = () => {
      const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control mode-toggle-control');
      container.innerHTML = `
        <button class="mode-toggle-btn" title="${darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}">
          <i class="bi ${darkMode ? 'bi-sun' : 'bi-moon'}"></i>
        </button>
      `;
      
      L.DomEvent.on(container, 'click', function(e: any) {
        L.DomEvent.stopPropagation(e);
        // This would trigger re-rendering with the opposite mode
        // In this demo it's just a button that could be connected to a state handler
      });
      
      return container;
    };
    map.addControl(modeToggleControl);

    // Add GeoJSON data with updated styles and interactivity
    if (data?.geometry) {
      const geoLayer = L.geoJSON(data.geometry as GeoJSON.GeoJsonObject, {
        onEachFeature: (feature: GeoJSON.Feature, layer: L.Layer) => {
          // Enhanced click handling with animation
          layer.on('click', () => {
            if (onSelect && feature.properties?.id) {
              // Zoom to the clicked feature with animation
              map.flyToBounds((layer as L.Polygon).getBounds(), {
                padding: [50, 50],
                duration: 0.5
              });
              
              // Call the select handler
              onSelect(feature.properties.id);
            }
          });
          
          // Add a pulsing effect to new items
          if (feature.properties?.status === 'new' || feature.properties?.status === 'hot') {
            layer.getElement()?.classList.add('pulse-animation');
          }
          
          // Enhanced tooltips
          if (feature.properties) {
            const tooltipContent = `
              <strong>${feature.properties.name || 'Unknown'}</strong>
              ${feature.properties.value ? `<br>Value: $${feature.properties.value.toLocaleString()}` : ''}
              ${feature.properties.lastUpdated ? `<br>Updated: ${new Date(feature.properties.lastUpdated).toLocaleDateString()}` : ''}
            `;
            layer.bindTooltip(tooltipContent, { direction: 'top', sticky: true });
          }
          
          // Enhanced popups with more data and interactive elements
          if (feature.properties) {
            const status = feature.properties.status || 'verified';
            const popupContent = `
              <div class="custom-popup ${status}">
                <h3>${feature.properties.name || 'Unknown'}</h3>
                <div class="popup-status ${status}">
                  <span class="status-indicator"></span>
                  <span class="status-text">${status.charAt(0).toUpperCase() + status.slice(1)}</span>
                </div>
                ${feature.properties.value ? `<div class="popup-value">$${feature.properties.value.toLocaleString()}</div>` : ''}
                ${feature.properties.lastUpdated ? 
                  `<div class="popup-date">Last updated: ${new Date(feature.properties.lastUpdated).toLocaleDateString()}</div>` : ''}
                <div class="popup-actions">
                  <button class="popup-btn view-btn">View Details</button>
                  <button class="popup-btn edit-btn">Edit</button>
                </div>
                ${type === 'county' ? '<div class="mini-chart" id="sparkline-' + feature.properties.id + '"></div>' : ''}
              </div>
            `;
            
            const popup = L.popup({
              maxWidth: 300,
              className: `status-${status}-popup`
            }).setContent(popupContent);
            
            layer.bindPopup(popup);
            
            // Handle popup events for interactivity
            layer.on('popupopen', function(e: L.LeafletEvent) {
              const viewBtn = document.querySelector('.popup-btn.view-btn');
              const editBtn = document.querySelector('.popup-btn.edit-btn');
              
              if (viewBtn) {
                viewBtn.addEventListener('click', function() {
                  if (onSelect && feature.properties?.id) {
                    onSelect(feature.properties.id);
                  }
                });
              }
              
              // TODO: Add sparkline chart to the popup if needed
              // This would require a charting library like Chart.js
            });
          }
        },
        style: (feature: any) => {
          // Get status from feature properties or default
          const status = feature?.properties?.status || 'verified';
          
          // Different styling based on the type and status
          switch (type) {
            case 'state':
              return { 
                color: getColorByStatus(status, darkMode),
                weight: 1,
                fillOpacity: 0.5,
                fillColor: getColorByStatus(status, darkMode)
              };
            case 'county':
              return { 
                color: getColorByStatus(status, darkMode),
                weight: 1,
                fillOpacity: 0.6,
                fillColor: getColorByStatus(status, darkMode) 
              };
            case 'property':
              return { 
                color: getColorByStatus(status, darkMode),
                weight: 1,
                fillOpacity: 0.7,
                fillColor: getColorByStatus(status, darkMode)
              };
            default:
              return { 
                color: getColorByStatus(status, darkMode),
                weight: 1,
                fillOpacity: 0.5
              };
          }
        }
      }).addTo(map);
      
      geoLayerRef.current = geoLayer;
      
      // Fit map to bounds of the data
      if (geoLayer.getBounds().isValid()) {
        map.fitBounds(geoLayer.getBounds(), {
          padding: [20, 20]
        });
      }
    }
    
    // Enhanced markers for properties when viewing at county level
    if (type === 'county' && data?.properties) {
      data.properties.forEach((property: any) => {
        if (property.geometry?.type === 'Point' && property.geometry.coordinates) {
          const [lng, lat] = property.geometry.coordinates;
          
          // Create custom marker with animation class
          const markerClassName = property.metadata?.taxStatus === 'Delinquent' ? 'marker-hot' : '';
          const markerStatus = property.metadata?.taxStatus === 'Delinquent' ? 'hot' : 'verified';
          
          // Create custom marker icon based on property status
          const markerIcon = L.divIcon({
            className: `custom-marker ${markerClassName}`,
            html: `<div class="marker-pin ${markerStatus}"></div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 30]
          });
          
          const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(map);
          
          // Enhanced popup with more data
          const popupContent = `
            <div class="custom-popup ${markerStatus}">
              <h3>${property.address?.street || 'Property'}</h3>
              <div class="popup-status ${markerStatus}">
                <span class="status-indicator"></span>
                <span class="status-text">${property.metadata?.taxStatus || 'Active'}</span>
              </div>
              <div class="popup-value">$${property.metadata?.marketValue?.toLocaleString() || 'N/A'}</div>
              <div class="popup-info">
                ${property.metadata?.propertyType || ''}
                ${property.metadata?.buildingArea ? `<br>${property.metadata.buildingArea} ${property.metadata.buildingAreaUnit}` : ''}
              </div>
              <div class="popup-actions">
                <button class="popup-btn view-btn">View Details</button>
                <button class="popup-btn edit-btn">Edit</button>
              </div>
            </div>
          `;
          
          const popup = L.popup({
            maxWidth: 300,
            className: `status-${markerStatus}-popup`
          }).setContent(popupContent);
          
          marker.bindPopup(popup);
          
          // Enhanced tooltip
          const tooltipContent = `
            <strong>${property.address?.street || 'Property'}</strong><br>
            ${property.metadata?.propertyType || ''}<br>
            ${property.metadata?.marketValue ? `$${property.metadata.marketValue.toLocaleString()}` : ''}
          `;
          marker.bindTooltip(tooltipContent, { direction: 'top' });
          
          // Click handler with animation
          marker.on('click', () => {
            map.flyTo([lat, lng], 16, {
              duration: 0.5
            });
            
            if (onSelect) {
              onSelect(property.id);
            }
          });
        }
      });
    }
    
    // Cleanup function
    return () => {
      map.remove();
    };
  }, [type, data, onSelect, darkMode]);

  // Update controls when dark mode changes
  useEffect(() => {
    if (legendControlRef.current) {
      legendControlRef.current.updateDarkMode(darkMode);
    }
    
    if (statsControlRef.current) {
      statsControlRef.current.updateDarkMode(darkMode);
    }
  }, [darkMode]);
  
  const mapClass = `map-container map-type-${type} ${darkMode ? 'dark-mode' : ''} ${className || ''}`;
  
  return <div ref={mapRef} className={mapClass} />;
};

export default MapComponent; 