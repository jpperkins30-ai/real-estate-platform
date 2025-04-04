import React from 'react';
import { PanelContentType } from '../types/layout.types';

// Map of content types to components
const contentRegistry: Record<string, React.ComponentType<any>> = {};

/**
 * Register a panel content component
 * 
 * @param contentType - Type identifier for the panel content
 * @param Component - React component to render for this content type
 */
export function registerPanelContent(
  contentType: PanelContentType,
  Component: React.ComponentType<any>
): void {
  contentRegistry[contentType] = Component;
}

/**
 * Get a panel content component by type
 * 
 * @param contentType - Type identifier for the panel content
 * @returns React component or null if not found
 */
export function getPanelContent(
  contentType: PanelContentType
): React.ComponentType<any> | null {
  return contentRegistry[contentType] || null;
}

/**
 * Get all registered panel content types
 * 
 * @returns Array of registered content types
 */
export function getRegisteredContentTypes(): PanelContentType[] {
  return Object.keys(contentRegistry) as PanelContentType[];
}

/**
 * Initialize the content registry with default components
 */
export function initializeContentRegistry(): void {
  // Import components dynamically to avoid circular dependencies
  import('../components/multiframe/panels/MapPanel').then(module => {
    registerPanelContent('map', module.MapPanel);
  });
  
  import('../components/multiframe/panels/StatePanel').then(module => {
    registerPanelContent('state', module.StatePanel);
  });
  
  import('../components/multiframe/panels/CountyPanel').then(module => {
    registerPanelContent('county', module.CountyPanel);
  });
  
  import('../components/multiframe/panels/PropertyPanel').then(module => {
    registerPanelContent('property', module.PropertyPanel);
  });
  
  // New panel types
  import('../components/multiframe/filters/FilterPanel').then(module => {
    registerPanelContent('filter', module.FilterPanel);
  });
  
  import('../components/multiframe/panels/StatsPanel').then(module => {
    registerPanelContent('stats', module.StatsPanel);
  });
  
  import('../components/multiframe/panels/ChartPanel').then(module => {
    registerPanelContent('chart', module.ChartPanel);
  });
} 