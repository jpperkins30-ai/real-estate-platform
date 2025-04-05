import React from 'react';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { MultiFrameContainer } from '../components/multiframe/MultiFrameContainer';
import { LayoutProvider } from '../context/LayoutContext';
import { PanelSyncProvider } from '../context/PanelSyncContext';
import { PreferencesProvider } from '../context/PreferencesContext';
import { ThemeProvider } from '../context/ThemeContext';
import { panelRegistry } from '../registry/panelRegistry';
import { waitFor } from '@testing-library/dom';

/**
 * Test Case ID: TC2701_integration_MultiFrameSystem
 * Test Summary: Integration tests for the multi-frame system, verifying that 
 * all components work together correctly with proper state propagation.
 */

// Mock panel components
const MockMapPanel = () => React.createElement('div', { 'data-testid': 'map-panel' }, 'Map Panel');
const MockPropertyPanel = () => React.createElement('div', { 'data-testid': 'property-panel' }, 'Property Panel');

// Register mock components
beforeAll(() => {
  panelRegistry.register('map', MockMapPanel);
  panelRegistry.register('property', MockPropertyPanel);
});

// Cleanup after tests
afterAll(() => {
  panelRegistry.unregister('map');
  panelRegistry.unregister('property');
});

describe('TC2701_integration_MultiFrameSystem: Multi-Frame System Integration', () => {
  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <PreferencesProvider>
        <ThemeProvider>
          <LayoutProvider>
            <PanelSyncProvider>
              {ui}
            </PanelSyncProvider>
          </LayoutProvider>
        </ThemeProvider>
      </PreferencesProvider>
    );
  };
  
  test('TC2701.1: Should initialize with correct layout type', () => {
    renderWithProviders(
      <MultiFrameContainer 
        initialLayout="single"
        defaultPanelContent={{ default: 'map' }}
      />
    );
    
    expect(screen.getByTestId('single-layout')).toBeInTheDocument();
  });
  
  test('TC2701.2: Should change layout type', async () => {
    renderWithProviders(
      <MultiFrameContainer 
        initialLayout="single"
        defaultPanelContent={{ default: 'map' }}
      />
    );
    
    const layoutSelector = screen.getByTestId('layout-selector-dual');
    fireEvent.click(layoutSelector);
    
    await waitFor(() => {
      expect(screen.getByTestId('dual-layout')).toBeInTheDocument();
    });
  });
  
  test('TC2701.3: Should render correct panel content', () => {
    renderWithProviders(
      <MultiFrameContainer 
        initialLayout="dual"
        panels={[
          { id: 'map-panel', contentType: 'map', title: 'Map', position: { row: 0, col: 0 } },
          { id: 'property-panel', contentType: 'property', title: 'Property', position: { row: 0, col: 1 } }
        ]}
      />
    );
    
    expect(screen.getByTestId('map-panel')).toBeInTheDocument();
    expect(screen.getByTestId('property-panel')).toBeInTheDocument();
  });
}); 