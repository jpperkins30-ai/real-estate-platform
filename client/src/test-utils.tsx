import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import { PanelContentType, AdvancedPanelPosition, StandardPanelConfig } from './types/layout.types';

/** Router testing utilities */

// Define router options type
interface RouterOptions extends RenderOptions {
  route?: string;
  routes?: Array<{path: string, element: ReactElement}>;
}

/**
 * Render a component with router context
 */
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

/**
 * Create mock panel props for testing
 */
export const createPanelHeaderProps = (overrides = {}) => ({
  title: 'Test Panel',
  isMaximized: false,
  onAction: vi.fn(),
  showMaximizeButton: true,
  showCloseButton: true,
  className: '',
  draggable: false,
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
  buttonLabel: 'Launch Wizard',
  showStatus: true,
  className: '',
  timeout: 5000,
  ...overrides
});

/**
 * Create mock panel config for testing
 */
export function createMockPanelConfig(overrides: Partial<StandardPanelConfig> = {}): StandardPanelConfig {
  return {
    id: 'test-panel',
    contentType: 'map',
    title: 'Test Panel',
    visible: true,
    closable: true,
    maximizable: true,
    position: { row: 0, col: 0 },
    size: { width: 100, height: 100 },
    ...overrides
  };
}

// Create mock panels array
export function createMockPanels() {
  return [
    createMockPanelConfig({ id: 'panel-1' }),
    createMockPanelConfig({ 
      id: 'panel-2', 
      contentType: 'property',
      position: { row: 1, col: 0 }
    })
  ];
}

/**
 * Create mock localStorage for testing
 */
export function createMockLocalStorage() {
  const store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    })
  };
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