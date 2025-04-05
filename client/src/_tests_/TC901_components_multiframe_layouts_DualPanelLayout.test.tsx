// Test Case 901: Verify DualPanelLayout renders with two panels correctly
// Test Case TC901: Verify DualPanelLayout renders with two panels correctly
// Test Case TC999: Verify components_multiframe_layouts_DualPanelLayout functionality
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DualPanelLayout } from '../../src/components/multiframe/layouts/DualPanelLayout';

// Mock PanelContainer component
vi.mock('../../src/components/multiframe/PanelContainer', () => ({
  PanelContainer: ({ id, title, contentType }) => (
    <div data-testid={`panel-container-${id}`}>
      <div data-testid={`panel-title-${id}`}>{title}</div>
      <div data-testid={`panel-content-type-${id}`}>{contentType}</div>
    </div>
  )
}));

describe('DualPanelLayout', () => {
  it('renders two panel containers with the correct props', () => {
    const panels = [
      {
        id: 'left-panel',
        title: 'Left Panel',
        contentType: 'map',
        position: { row: 0, col: 0 },
        size: { width: 50, height: 100 }
      },
      {
        id: 'right-panel',
        title: 'Right Panel',
        contentType: 'property',
        position: { row: 0, col: 1 },
        size: { width: 50, height: 100 }
      }
    ];
    
    render(<DualPanelLayout panels={panels} />);
    
    expect(screen.getByTestId('dual-layout')).toBeInTheDocument();
    expect(screen.getByTestId('panel-container-left-panel')).toBeInTheDocument();
    expect(screen.getByTestId('panel-container-right-panel')).toBeInTheDocument();
    expect(screen.getByTestId('panel-title-left-panel')).toHaveTextContent('Left Panel');
    expect(screen.getByTestId('panel-title-right-panel')).toHaveTextContent('Right Panel');
    expect(screen.getByTestId('panel-content-type-left-panel')).toHaveTextContent('map');
    expect(screen.getByTestId('panel-content-type-right-panel')).toHaveTextContent('property');
  });
  
  it('shows empty message when insufficient panels are provided', () => {
    render(<DualPanelLayout panels={[{ id: 'single', title: 'Single', contentType: 'map' }]} />);
    
    expect(screen.getByTestId('empty-dual-layout')).toBeInTheDocument();
    expect(screen.getByText('Insufficient panels configured')).toBeInTheDocument();
  });
}); 




