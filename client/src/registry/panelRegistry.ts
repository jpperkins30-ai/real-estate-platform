import React from 'react';
import { PanelContentProps } from '../types/panel.types';

// Define allowed panel types
export type PanelType = 
  | 'map' 
  | 'property' 
  | 'filter' 
  | 'stats' 
  | 'chart' 
  | 'list' 
  | 'state' 
  | 'county';

// Panel component type
export type PanelComponent = React.ComponentType<PanelContentProps>;

// Registry interface
interface PanelRegistry {
  register: (type: PanelType, component: PanelComponent) => void;
  unregister: (type: PanelType) => void;
  get: (type: PanelType) => PanelComponent | null;
  getAll: () => Record<PanelType, PanelComponent>;
  getAvailableTypes: () => PanelType[];
}

// Create registry
class PanelRegistryImpl implements PanelRegistry {
  private registry: Partial<Record<PanelType, PanelComponent>> = {};
  
  register(type: PanelType, component: PanelComponent): void {
    this.registry[type] = component;
    console.log(`Panel component registered: ${type}`);
  }
  
  unregister(type: PanelType): void {
    if (this.registry[type]) {
      delete this.registry[type];
      console.log(`Panel component unregistered: ${type}`);
    }
  }
  
  get(type: PanelType): PanelComponent | null {
    return this.registry[type] || null;
  }
  
  getAll(): Record<PanelType, PanelComponent> {
    return this.registry as Record<PanelType, PanelComponent>;
  }
  
  getAvailableTypes(): PanelType[] {
    return Object.keys(this.registry) as PanelType[];
  }
}

// Create singleton instance
export const panelRegistry: PanelRegistry = new PanelRegistryImpl();

/**
 * React hook to get a panel component
 */
export function usePanelComponent(type: PanelType): PanelComponent | null {
  return React.useMemo(() => panelRegistry.get(type), [type]);
}

/**
 * Utility to register multiple panel components at once
 */
export function registerPanels(components: Partial<Record<PanelType, PanelComponent>>): void {
  Object.entries(components).forEach(([type, component]) => {
    panelRegistry.register(type as PanelType, component);
  });
}

/**
 * HOC to register a panel component
 */
export function withPanelRegistration<P extends PanelContentProps>(
  type: PanelType,
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  // Register the component
  panelRegistry.register(type, Component as unknown as PanelComponent);
  
  // Return the original component
  return Component;
} 