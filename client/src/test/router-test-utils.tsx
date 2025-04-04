import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

/**
 * Custom render function that includes Router context for testing components that use router
 * @param ui Component to render
 * @param options Config options including initial route and history
 * @returns Enhanced render result with history
 */
export function renderWithRouter(
  ui: React.ReactElement,
  { route = '/', history = [route] }: { route?: string; history?: string[] } = {}
) {
  return {
    ...render(
      <MemoryRouter initialEntries={history}>
        <Routes>
          <Route path="*" element={ui} />
        </Routes>
      </MemoryRouter>
    ),
    history
  };
} 