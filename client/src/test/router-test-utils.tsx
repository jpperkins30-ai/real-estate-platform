import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Define types for router testing
interface RenderWithRouterOptions extends RenderOptions {
  route?: string;
  history?: string[];
}

/**
 * Custom render function that includes Router context for testing components that use router
 * @param ui Component to render
 * @param options Config options including initial route and history
 * @returns Enhanced render result with history
 */
export function renderWithRouter(
  ui: ReactElement,
  { route = '/', history = [route], ...renderOptions }: RenderWithRouterOptions = {}
) {
  return {
    ...render(
      <MemoryRouter initialEntries={history}>
        <Routes>
          <Route path="*" element={ui} />
        </Routes>
      </MemoryRouter>,
      renderOptions
    ),
    history
  };
}

// Re-export everything from testing-library for convenience
export * from '@testing-library/react'; 