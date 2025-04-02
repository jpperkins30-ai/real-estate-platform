import React from 'react';

type PanelComponent = React.ComponentType<any>;

const panelRegistry = new Map<string, PanelComponent>();

export function registerPanelContent(type: string, component: PanelComponent) {
  panelRegistry.set(type, component);
}

export function getPanelContent(type: string): PanelComponent | null {
  return panelRegistry.get(type) || null;
}

export function unregisterPanelContent(type: string) {
  panelRegistry.delete(type);
} 