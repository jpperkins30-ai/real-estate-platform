// Test Case 921: Verify QuadPanelLayout renders with four panels correctly
// Test Case TC921: Verify QuadPanelLayout renders with four panels correctly
// Test Case TC999: Verify components_multiframe_layouts_QuadPanelLayout functionality
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QuadPanelLayout } from '../../src/components/multiframe/layouts/QuadPanelLayout';

// Mock PanelContainer component
vi.mock('../../src/components/multiframe/PanelContainer', () => ({
  PanelContainer: ({ id, title, contentType }) => (
    <div data-testid={`panel-container-${id}`}>
      <div data-testid={`panel-title-${id}`}>{title}</div>
      <div data-testid={`panel-content-type-${id}`}>{contentType}</div>
    </div>
  )
}));

describe('QuadPanelLayout', () => {
  it('renders four panel containers with the correct props', () => {
    const panels = [
      {
        id: 'top-left',
        title: 'Top Left Panel',
        contentType: 'map',
        position: { row: 0, col: 0 },
        size: { width: 50, height: 50 }
      },
      {
        id: 'top-right',
        title: 'Top Right Panel',
        contentType: 'state',
        position: { row: 0, col: 1 },
        size: { width: 50, height: 50 }
      },
      {
        id: 'bottom-left',
        title: 'Bottom Left Panel',
        contentType: 'county',
        position: { row: 1, col: 0 },
        size: { width: 50, height: 50 }
      },
      {
        id: 'bottom-right',
        title: 'Bottom Right Panel',
        contentType: 'property',
        position: { row: 1, col: 1 },
        size: { width: 50, height: 50 }
      }
    ];
    
    render(<QuadPanelLayout panels={panels} />);
    
    expect(screen.getByTestId('quad-layout')).toBeInTheDocument();
    expect(screen.getByTestId('panel-container-top-left')).toBeInTheDocument();
    expect(screen.getByTestId('panel-container-top-right')).toBeInTheDocument();
    expect(screen.getByTestId('panel-container-bottom-left')).toBeInTheDocument();
    expect(screen.getByTestId('panel-container-bottom-right')).toBeInTheDocument();
  });
  
  it('shows empty message when insufficient panels are provided', () => {
    render(<QuadPanelLayout panels={[{ id: 'single', title: 'Single', contentType: 'map' }]} />);
    
    expect(screen.getByTestId('empty-quad-layout')).toBeInTheDocument();
    expect(screen.getByText('Insufficient panels configured')).toBeInTheDocument();
  });
}); 




