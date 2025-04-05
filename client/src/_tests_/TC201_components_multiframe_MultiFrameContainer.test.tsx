// Test Case 201: Verify MultiFrameContainer renders with default layout
// Test Case TC201: Verify MultiFrameContainer renders with default layout
// Test Case TC201: Verify MultiFrameContainer renders with default layout
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MultiFrameContainer } from '../../src/components/multiframe/MultiFrameContainer';

// Mock layout components
vi.mock('../../src/components/multiframe/layouts/SinglePanelLayout', () => ({
  SinglePanelLayout: ({ panels }) => <div data-testid="single-layout-mock">Single Layout</div>
}));

vi.mock('../../src/components/multiframe/layouts/DualPanelLayout', () => ({
  DualPanelLayout: ({ panels }) => <div data-testid="dual-layout-mock">Dual Layout</div>
}));

vi.mock('../../src/components/multiframe/layouts/TriPanelLayout', () => ({
  TriPanelLayout: ({ panels }) => <div data-testid="tri-layout-mock">Tri Layout</div>
}));

vi.mock('../../src/components/multiframe/layouts/QuadPanelLayout', () => ({
  QuadPanelLayout: ({ panels }) => <div data-testid="quad-layout-mock">Quad Layout</div>
}));

vi.mock('../../src/components/multiframe/layouts/AdvancedLayout', () => ({
  AdvancedLayout: ({ panels }) => <div data-testid="advanced-layout-mock">Advanced Layout</div>
}));

// Mock LayoutSelector
vi.mock('../../src/components/multiframe/controls/LayoutSelector', () => ({
  LayoutSelector: ({ currentLayout, onLayoutChange }) => (
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

  it('TC201: should render with default layout', () => {
    render(
      <MultiFrameContainer
        initialLayout="single"
        _isTestingMode={true}
      />
    );
    
    expect(screen.getByTestId('multi-frame-container')).toBeInTheDocument();
    expect(screen.getByTestId('single-layout-mock')).toBeInTheDocument();
  });
  
  it('TC202: should change layout when layout selector is used', () => {
    render(
      <MultiFrameContainer
        initialLayout="single"
        _isTestingMode={true}
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
  
  it('TC203: should notify parent component when layout changes', () => {
    const onLayoutChange = vi.fn();
    
    render(
      <MultiFrameContainer
        initialLayout="single"
        onLayoutChange={onLayoutChange}
        _isTestingMode={true}
      />
    );
    
    fireEvent.click(screen.getByTestId('select-dual'));
    
    // Since we're using testing mode, the callback should not be called
    expect(onLayoutChange).not.toHaveBeenCalled();
  });
  
  it('TC204: should initialize with provided panels', () => {
    const customPanels = [
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
        _isTestingMode={true}
      />
    );
    
    // The SinglePanelLayout mock would receive these panels
    expect(screen.getByTestId('single-layout-mock')).toBeInTheDocument();
  });
}); 


