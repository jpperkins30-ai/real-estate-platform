import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DualPanelLayout } from '../../layouts/DualPanelLayout';
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

describe('DualPanelLayout', () => {
  it('renders two panel containers with the correct props', () => {
    const panels: PanelConfig[] = [
      {
        id: 'left-panel',
        title: 'Left Panel',
        contentType: 'map' as PanelContentType,
        position: { row: 0, col: 0 },
        size: { width: 50, height: 100 }
      },
      {
        id: 'right-panel',
        title: 'Right Panel',
        contentType: 'property' as PanelContentType,
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
    const panels: PanelConfig[] = [{
      id: 'single',
      title: 'Single',
      contentType: 'map' as PanelContentType,
      position: { row: 0, col: 0 },
      size: { width: 100, height: 100 }
    }];
    
    render(<DualPanelLayout panels={panels} />);
    
    expect(screen.getByTestId('empty-dual-layout')).toBeInTheDocument();
    expect(screen.getByText('Insufficient panels configured')).toBeInTheDocument();
  });
}); 