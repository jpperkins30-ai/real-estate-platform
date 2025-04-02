import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SinglePanelLayout } from '../../layouts/SinglePanelLayout';
import { PanelConfig, PanelContentType } from '../../../types/layout.types';

// Mock PanelContainer component
vi.mock('../../../../components/multiframe/PanelContainer', () => ({
  PanelContainer: ({ id, title, contentType }: { id: string; title: string; contentType: PanelContentType }) => (
    <div data-testid={`panel-container-${id}`}>
      <div data-testid="panel-title">{title}</div>
      <div data-testid="panel-content-type">{contentType}</div>
    </div>
  )
}));

describe('SinglePanelLayout', () => {
  it('renders a panel container with the correct props', () => {
    const panels: PanelConfig[] = [{
      id: 'test-panel',
      title: 'Test Panel',
      contentType: 'map' as PanelContentType,
      position: { row: 0, col: 0 },
      size: { width: 100, height: 100 }
    }];
    
    render(<SinglePanelLayout panels={panels} />);
    
    expect(screen.getByTestId('single-layout')).toBeInTheDocument();
    expect(screen.getByTestId('panel-container-test-panel')).toBeInTheDocument();
    expect(screen.getByTestId('panel-title')).toHaveTextContent('Test Panel');
    expect(screen.getByTestId('panel-content-type')).toHaveTextContent('map');
  });
  
  it('shows empty message when no panels are provided', () => {
    render(<SinglePanelLayout panels={[]} />);
    
    expect(screen.getByTestId('empty-single-layout')).toBeInTheDocument();
    expect(screen.getByText('No panel configured')).toBeInTheDocument();
  });
}); 