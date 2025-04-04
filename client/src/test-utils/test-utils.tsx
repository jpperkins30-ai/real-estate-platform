import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Define types for router testing
interface RenderWithRouterOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  history?: string[];
}

// Create enhanced render function
function renderWithRouter(
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

// Re-export everything from testing-library
export * from '@testing-library/react';
export { renderWithRouter }; 