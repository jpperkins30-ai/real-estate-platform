// Test Case 911: Verify TriPanelLayout renders with three panels correctly
// Test Case TC911: Verify TriPanelLayout renders with three panels correctly
// Test Case TC999: Verify components_multiframe_layouts_TriPanelLayout functionality
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TriPanelLayout } from '../../src/components/multiframe/layouts/TriPanelLayout';

// Mock PanelContainer component
vi.mock('../../src/components/multiframe/PanelContainer', () => ({
  PanelContainer: ({ id, title, contentType }) => (
    <div data-testid={`panel-container-${id}`}>
      <div data-testid={`panel-title-${id}`}>{title}</div>
      <div data-testid={`panel-content-type-${id}`}>{contentType}</div>
    </div>
  )
}));

describe('TriPanelLayout', () => {
  it('renders three panel containers with the correct props', () => {
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
        id: 'bottom',
        title: 'Bottom Panel',
        contentType: 'county',
        position: { row: 1, col: 0 },
        size: { width: 100, height: 50 }
      }
    ];
    
    render(<TriPanelLayout panels={panels} />);
    
    expect(screen.getByTestId('tri-layout')).toBeInTheDocument();
    expect(screen.getByTestId('panel-container-top-left')).toBeInTheDocument();
    expect(screen.getByTestId('panel-container-top-right')).toBeInTheDocument();
    expect(screen.getByTestId('panel-container-bottom')).toBeInTheDocument();
    expect(screen.getByTestId('panel-title-top-left')).toHaveTextContent('Top Left Panel');
    expect(screen.getByTestId('panel-title-top-right')).toHaveTextContent('Top Right Panel');
    expect(screen.getByTestId('panel-title-bottom')).toHaveTextContent('Bottom Panel');
  });
  
  it('shows empty message when insufficient panels are provided', () => {
    render(<TriPanelLayout panels={[{ id: 'single', title: 'Single', contentType: 'map' }]} />);
    
    expect(screen.getByTestId('empty-tri-layout')).toBeInTheDocument();
    expect(screen.getByText('Insufficient panels configured')).toBeInTheDocument();
  });
}); 




