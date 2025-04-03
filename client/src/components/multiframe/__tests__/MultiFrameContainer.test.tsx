import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MultiFrameContainer } from '../MultiFrameContainer';
import { LayoutType, PanelConfig } from '../../../types/layout.types';

// Mock layout components
vi.mock('../layouts/SinglePanelLayout', () => ({
  SinglePanelLayout: ({ panels }: { panels: PanelConfig[] }) => (
    <div data-testid="single-layout-mock">Single Layout</div>
  )
}));

vi.mock('../layouts/DualPanelLayout', () => ({
  DualPanelLayout: ({ panels }: { panels: PanelConfig[] }) => (
    <div data-testid="dual-layout-mock">Dual Layout</div>
  )
}));

vi.mock('../layouts/TriPanelLayout', () => ({
  TriPanelLayout: ({ panels }: { panels: PanelConfig[] }) => (
    <div data-testid="tri-layout-mock">Tri Layout</div>
  )
}));

vi.mock('../layouts/QuadPanelLayout', () => ({
  QuadPanelLayout: ({ panels }: { panels: PanelConfig[] }) => (
    <div data-testid="quad-layout-mock">Quad Layout</div>
  )
}));

vi.mock('../layouts/AdvancedLayout', () => ({
  AdvancedLayout: ({ panels }: { panels: PanelConfig[] }) => (
    <div data-testid="advanced-layout-mock">Advanced Layout</div>
  )
}));

// Mock LayoutSelector
vi.mock('../controls/LayoutSelector', () => ({
  LayoutSelector: ({ 
    currentLayout, 
    onLayoutChange 
  }: { 
    currentLayout: LayoutType;
    onLayoutChange: (layout: LayoutType) => void;
  }) => (
    <div data-testid="layout-selector-mock">
      <button onClick={() => onLayoutChange('single')} data-testid="select-single">Single</button>
      <button onClick={() => onLayoutChange('dual')} data-testid="select-dual">Dual</button>
      <button onClick={() => onLayoutChange('tri')} data-testid="select-tri">Tri</button>
      <button onClick={() => onLayoutChange('quad')} data-testid="select-quad">Quad</button>
      <button onClick={() => onLayoutChange('advanced')} data-testid="select-advanced">Advanced</button>
      <div>Current: {currentLayout}</div>
    </div>
  )
}));

describe('MultiFrameContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default layout', () => {
    render(
      <MultiFrameContainer
        initialLayout="single"
      />
    );
    
    expect(screen.getByTestId('multi-frame-container')).toBeInTheDocument();
    expect(screen.getByTestId('single-layout-mock')).toBeInTheDocument();
  });
  
  it('changes layout when layout selector is used', () => {
    render(
      <MultiFrameContainer
        initialLayout="single"
      />
    );
    
    // Single layout initially
    expect(screen.getByTestId('single-layout-mock')).toBeInTheDocument();
    
    // Change to dual layout
    fireEvent.click(screen.getByTestId('select-dual'));
    expect(screen.getByTestId('dual-layout-mock')).toBeInTheDocument();
    expect(screen.queryByTestId('single-layout-mock')).not.toBeInTheDocument();
    
    // Change to tri layout
    fireEvent.click(screen.getByTestId('select-tri'));
    expect(screen.getByTestId('tri-layout-mock')).toBeInTheDocument();
    
    // Change to quad layout
    fireEvent.click(screen.getByTestId('select-quad'));
    expect(screen.getByTestId('quad-layout-mock')).toBeInTheDocument();
    
    // Change to advanced layout
    fireEvent.click(screen.getByTestId('select-advanced'));
    expect(screen.getByTestId('advanced-layout-mock')).toBeInTheDocument();
  });
  
  it('notifies parent component when layout changes', () => {
    const onLayoutChange = vi.fn();
    
    render(
      <MultiFrameContainer
        initialLayout="single"
        onLayoutChange={onLayoutChange}
      />
    );
    
    fireEvent.click(screen.getByTestId('select-dual'));
    
    expect(onLayoutChange).toHaveBeenCalledWith(expect.objectContaining({
      name: 'dual layout',
      type: 'dual'
    }));
  });
  
  it('initializes with provided panels', () => {
    const customPanels: PanelConfig[] = [
      {
        id: 'custom-panel',
        contentType: 'map',
        title: 'Custom Panel',
        position: { row: 0, col: 0 },
        size: { width: 100, height: 100 }
      }
    ];
    
    render(
      <MultiFrameContainer
        initialLayout="single"
        panels={customPanels}
      />
    );
    
    // The SinglePanelLayout mock would receive these panels
    expect(screen.getByTestId('single-layout-mock')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const customClass = 'custom-container-class';
    
    render(
      <MultiFrameContainer
        initialLayout="single"
        className={customClass}
      />
    );
    
    const container = screen.getByTestId('multi-frame-container');
    expect(container).toHaveClass(customClass);
  });
}); 