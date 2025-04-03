import React from 'react';
import { PanelContentType } from '../../types/layout.types';

type PanelComponent = React.ComponentType<any>;

/**
 * Registry for panel components that can be used within the MultiFrame system
 */
class PanelRegistry {
  private panelTypes: Map<PanelContentType | string, PanelComponent> = new Map();
  
  /**
   * Register a panel component
   * @param type The unique identifier for this panel type
   * @param component The React component to use for this panel type
   */
  register(type: PanelContentType | string, component: PanelComponent): void {
    if (this.panelTypes.has(type)) {
      console.warn(`Panel type "${type}" is already registered. It will be overwritten.`);
    }
    
    this.panelTypes.set(type, component);
  }
  
  /**
   * Get a panel component by type
   * @param type The panel type identifier
   * @returns The component for this panel type, or undefined if not found
   */
  getComponent(type: PanelContentType | string): PanelComponent | undefined {
    return this.panelTypes.get(type);
  }
  
  /**
   * Check if a panel type is registered
   * @param type The panel type identifier
   * @returns True if the panel type is registered
   */
  hasComponent(type: PanelContentType | string): boolean {
    return this.panelTypes.has(type);
  }
  
  /**
   * Get all registered panel types
   * @returns An array of registered panel type identifiers
   */
  getRegisteredTypes(): (PanelContentType | string)[] {
    return Array.from(this.panelTypes.keys());
  }
  
  /**
   * Unregister a panel component
   * @param type The panel type identifier to unregister
   * @returns True if the panel was unregistered, false if it wasn't found
   */
  unregister(type: PanelContentType | string): boolean {
    return this.panelTypes.delete(type);
  }
  
  /**
   * Clear all registered panel components
   */
  clear(): void {
    this.panelTypes.clear();
  }
}

// Export a singleton instance of the registry
export const panelRegistry = new PanelRegistry();

// Export a convenience function for component registration
export function registerPanel(type: PanelContentType | string, component: PanelComponent): void {
  panelRegistry.register(type, component);
}

// Export a convenience function for component retrieval
export function getPanelComponent(type: PanelContentType | string): PanelComponent | undefined {
  return panelRegistry.getComponent(type);
} 