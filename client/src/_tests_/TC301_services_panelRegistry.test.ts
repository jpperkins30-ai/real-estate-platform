import { panelRegistry, PanelType } from '../registry/panelRegistry';
import React from 'react';
import { PanelContentProps } from '../types/panel.types';

/**
 * Test Case ID: TC301_services_panelRegistry
 * Test Summary: Verifies the functionality of the panel registry service
 * including registering, unregistering, and retrieving panel components.
 */

// Mock panel component
const MockPanel = (props: PanelContentProps) => React.createElement('div', { 'data-testid': 'mock-panel' });

describe('TC301_services_panelRegistry: Panel Registry Service', () => {
  beforeEach(() => {
    // Clear registry before each test
    panelRegistry.getAvailableTypes().forEach(type => {
      panelRegistry.unregister(type);
    });
  });
  
  test('TC301.1: Should register a panel component', () => {
    panelRegistry.register('map', MockPanel);
    
    const component = panelRegistry.get('map');
    expect(component).toBe(MockPanel);
  });
  
  test('TC301.2: Should unregister a panel component', () => {
    panelRegistry.register('map', MockPanel);
    panelRegistry.unregister('map');
    
    const component = panelRegistry.get('map');
    expect(component).toBeNull();
  });
  
  test('TC301.3: Should return null for unregistered component', () => {
    const component = panelRegistry.get('unknown' as PanelType);
    expect(component).toBeNull();
  });
  
  test('TC301.4: Should return all registered components', () => {
    panelRegistry.register('map', MockPanel);
    panelRegistry.register('property', MockPanel);
    
    const all = panelRegistry.getAll();
    expect(Object.keys(all)).toHaveLength(2);
    expect(all.map).toBe(MockPanel);
    expect(all.property).toBe(MockPanel);
  });
  
  test('TC301.5: Should return available types', () => {
    panelRegistry.register('map', MockPanel);
    panelRegistry.register('chart', MockPanel);
    
    const types = panelRegistry.getAvailableTypes();
    expect(types).toHaveLength(2);
    expect(types).toContain('map');
    expect(types).toContain('chart');
  });
}); 