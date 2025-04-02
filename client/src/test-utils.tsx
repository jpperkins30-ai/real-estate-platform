import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import { PanelConfig, StandardPanelConfig } from './types/layout.types';

/** Router testing utilities */
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
  contentType: 'map',
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

// Re-export everything from testing-library
export * from '@testing-library/react';
export * from '@testing-library/user-event'; 