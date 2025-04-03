import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import { PanelContentType, AdvancedPanelPosition } from './types/layout.types';

// Define router options type
interface RouterOptions extends RenderOptions {
  route?: string;
  routes?: Array<{path: string, element: ReactElement}>;
}

// Create renderWithRouter utility
export function renderWithRouter(
  ui: ReactElement,
  { route = '/', routes = [], ...renderOptions }: RouterOptions = {}
) {
  return {
    ...render(
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          {routes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
          <Route path="*" element={ui} />
        </Routes>
      </MemoryRouter>,
      renderOptions
    )
  };
}

// Create test data generators
export const createPanelHeaderProps = (overrides = {}) => ({
  title: 'Test Panel',
  isMaximized: false,
  onAction: vi.fn(),
  showMaximizeButton: true,
  showCloseButton: true,
  ...overrides
});

export const createDraggablePanelProps = (overrides = {}) => ({
  id: 'test-panel',
  title: 'Test Panel',
  contentType: 'map' as PanelContentType,
  initialState: {},
  onStateChange: vi.fn(),
  onAction: vi.fn(),
  className: '',
  maximizable: true,
  closable: true,
  ...overrides
});

export const createControllerWizardProps = (overrides = {}) => ({
  entityType: 'state' as const,
  entityId: 'CA',
  timeout: 5000,
  ...overrides
});

// Mock generator utilities
export function createMockPanelProps(overrides = {}) {
  return {
    id: 'test-panel',
    title: 'Test Panel',
    contentType: 'map' as PanelContentType,
    maximizable: true,
    closable: true,
    onAction: vi.fn(),
    ...overrides
  };
}

// Create panel configuration mock
export function createMockPanelConfig(overrides = {}) {
  return {
    id: 'panel-1',
    contentType: 'map' as PanelContentType,
    title: 'Map Panel',
    position: { x: 0, y: 0, width: 70, height: 70 } as AdvancedPanelPosition,
    maximizable: true,
    closable: true,
    ...overrides
  };
}

// Create mock panels array
export function createMockPanels() {
  return [
    createMockPanelConfig({ id: 'panel-1' }),
    createMockPanelConfig({ 
      id: 'panel-2', 
      contentType: 'property' as PanelContentType,
      position: { x: 70, y: 0, width: 30, height: 70 } as AdvancedPanelPosition 
    })
  ];
}

// Helper to create a text matcher that's flexible
export function textMatcher(text: string) {
  return (content: string, element: Element): boolean => {
    const normalizedText = content.replace(/\s+/g, ' ').trim().toLowerCase();
    const normalizedTarget = text.replace(/\s+/g, ' ').trim().toLowerCase();
    return normalizedText.includes(normalizedTarget);
  };
}

// Mock navigate function for router tests
export const mockNavigate = vi.fn();

// Re-export everything from testing-library
export * from '@testing-library/react';
export * from '@testing-library/user-event'; 