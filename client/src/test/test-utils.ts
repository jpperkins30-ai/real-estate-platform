import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import { PanelConfig, PanelContentType } from '../types/layout.types';

// Custom render with router
export function renderWithRouter(ui: React.ReactElement, options = {}) {
  const { route = '/', ...renderOptions } = options;
  
  return {
    ...render(
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="*" element={ui} />
        </Routes>
      </MemoryRouter>,
      renderOptions
    ),
  };
}

// Helper function to create mock panel configurations
export function createMockPanelConfig(overrides = {}): PanelConfig {
  return {
    id: 'panel-1',
    contentType: 'map' as PanelContentType,
    title: 'Map Panel',
    position: { x: 0, y: 0, width: 70, height: 70 },
    maximizable: true,
    closable: true,
    visible: true,
    ...overrides
  };
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { vi } from 'vitest';
export { userEvent } from '@testing-library/user-event'; 