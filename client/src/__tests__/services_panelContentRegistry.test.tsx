import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  registerPanelContent, 
  getPanelContent, 
  getRegisteredContentTypes,
  initializeContentRegistry
} from 'src/services/panelContentRegistry';

// Mock dynamic imports
vi.mock('../../components/multiframe/panels/MapPanel', () => ({
  MapPanel: () => <div>Map Panel</div>
}));

vi.mock('../../components/multiframe/panels/StatePanel', () => ({
  StatePanel: () => <div>State Panel</div>
}));

vi.mock('../../components/multiframe/panels/CountyPanel', () => ({
  CountyPanel: () => <div>County Panel</div>
}));

vi.mock('../../components/multiframe/panels/PropertyPanel', () => ({
  PropertyPanel: () => <div>Property Panel</div>
}));

vi.mock('../../components/multiframe/panels/FilterPanel', () => ({
  FilterPanel: () => <div>Filter Panel</div>
}));

vi.mock('../../components/multiframe/panels/StatsPanel', () => ({
  StatsPanel: () => <div>Stats Panel</div>
}));

vi.mock('../../components/multiframe/panels/ChartPanel', () => ({
  ChartPanel: () => <div>Chart Panel</div>
}));

describe('panelContentRegistry', () => {
  beforeEach(() => {
    // Clear registry before each test
    vi.restoreAllMocks();
    
    // Clear any registered content
    const registry = vi.spyOn(global, 'Object').mockImplementation((obj) => {
      if (obj && typeof obj === 'object') {
        return Object.create(obj);
      }
      return {};
    });
  });
  
  it('registers and retrieves panel content components', () => {
    const MapComponent = () => <div>Map Component</div>;
    
    registerPanelContent('map', MapComponent);
    
    const retrievedComponent = getPanelContent('map');
    expect(retrievedComponent).toBe(MapComponent);
  });
  
  it('returns null for unregistered content types', () => {
    const component = getPanelContent('unregistered');
    expect(component).toBeNull();
  });
  
  it('returns registered content types', () => {
    registerPanelContent('map', () => <div>Map</div>);
    registerPanelContent('state', () => <div>State</div>);
    
    const types = getRegisteredContentTypes();
    expect(types).toContain('map');
    expect(types).toContain('state');
    expect(types.length).toBe(2);
  });
  
  it('initializes content registry with default components', async () => {
    // Initialize registry with default components
    initializeContentRegistry();
    
    // Wait for dynamic imports to resolve
    await vi.runAllTimersAsync();
    
    // Verify that components were registered
    expect(getRegisteredContentTypes()).toContain('map');
    expect(getRegisteredContentTypes()).toContain('state');
    expect(getRegisteredContentTypes()).toContain('county');
    expect(getRegisteredContentTypes()).toContain('property');
    expect(getRegisteredContentTypes()).toContain('filter');
    expect(getRegisteredContentTypes()).toContain('stats');
    expect(getRegisteredContentTypes()).toContain('chart');
  });
}); 


