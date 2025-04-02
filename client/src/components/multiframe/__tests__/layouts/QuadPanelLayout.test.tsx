import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QuadPanelLayout } from '../../layouts/QuadPanelLayout';
import { PanelConfig, PanelContentType } from '../../../types/layout.types';

// Mock PanelContainer component
vi.mock('../../../../components/multiframe/PanelContainer', () => ({
  PanelContainer: ({ id, title, contentType }: { id: string; title: string; contentType: PanelContentType }) => (
    <div data-testid={`panel-container-${id}`}>
      <div data-testid={`panel-title-${id}`}>{title}</div>
      <div data-testid={`panel-content-type-${id}`}>{contentType}</div>
    </div>
  )
}));

describe('QuadPanelLayout', () => {
  it('renders four panel containers with the correct props', () => {
    const panels: PanelConfig[] = [
      {
        id: 'top-left',
        title: 'Top Left Panel',
        contentType: 'map' as PanelContentType,
        position: { row: 0, col: 0 },
        size: { width: 50, height: 50 }
      },
      {
        id: 'top-right',
        title: 'Top Right Panel',
        contentType: 'state' as PanelContentType,
        position: { row: 0, col: 1 },
        size: { width: 50, height: 50 }
      },
      {
        id: 'bottom-left',
        title: 'Bottom Left Panel',
        contentType: 'county' as PanelContentType,
        position: { row: 1, col: 0 },
        size: { width: 50, height: 50 }
      },
      {
        id: 'bottom-right',
        title: 'Bottom Right Panel',
        contentType: 'property' as PanelContentType,
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
    expect(screen.getByTestId('panel-title-top-left')).toHaveTextContent('Top Left Panel');
    expect(screen.getByTestId('panel-title-top-right')).toHaveTextContent('Top Right Panel');
    expect(screen.getByTestId('panel-title-bottom-left')).toHaveTextContent('Bottom Left Panel');
    expect(screen.getByTestId('panel-title-bottom-right')).toHaveTextContent('Bottom Right Panel');
  });
  
  it('shows empty message when insufficient panels are provided', () => {
    const panels: PanelConfig[] = [{
      id: 'single',
      title: 'Single',
      contentType: 'map' as PanelContentType,
      position: { row: 0, col: 0 },
      size: { width: 100, height: 100 }
    }];
    
    render(<QuadPanelLayout panels={panels} />);
    
    expect(screen.getByTestId('empty-quad-layout')).toBeInTheDocument();
    expect(screen.getByText('Insufficient panels configured')).toBeInTheDocument();
  });
}); 