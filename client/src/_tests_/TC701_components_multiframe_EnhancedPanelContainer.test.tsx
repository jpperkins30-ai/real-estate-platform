// Test Case 701: Verify PanelContainer renders with correct props
// Test Case TC701: Verify PanelContainer renders with correct props
// Test Case TC701: Verify PanelContainer renders with correct props
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EnhancedMultiFrameContainer } from '../../src/components/multiframe/EnhancedMultiFrameContainer';
import { LayoutType, LayoutConfig, AdvancedPanelConfig } from '../../src/types/layout.types';

// Create mock components and hooks
vi.mock('../../src/hooks/useAdvancedLayout', () => ({
  useAdvancedLayout: () => ({
    panelStates: [],
    maximizedPanelId: null,
    isAnyPanelMaximized: false,
    handlePanelAction: vi.fn(),
    resetLayout: vi.fn()
  })
}));

// Mock AdvancedLayout component
vi.mock('../../src/components/multiframe/layouts/AdvancedLayout', () => ({
  AdvancedLayout: ({ panels, onPanelPositionChange, onPanelStateChange, onPanelClose, onPanelAdd }: { 
    panels: AdvancedPanelConfig[]; 
    onPanelPositionChange?: any;
    onPanelStateChange?: any;
    onPanelClose?: any;
    onPanelAdd?: any;
  }) => (
    <div data-testid="advanced-layout-mock">
      <div data-testid="panels-count">
        {panels.length} panels
      </div>
      <div data-testid="layout-type">advanced</div>
    </div>
  )
}));

// Mock LayoutSelector component
vi.mock('../../src/components/multiframe/controls/LayoutSelector', () => ({
  LayoutSelector: ({ currentLayout, onLayoutChange, availableLayouts }: { 
    currentLayout: LayoutType; 
    onLayoutChange?: (layout: LayoutType) => void;
    availableLayouts?: LayoutType[];
  }) => (
    <div data-testid="layout-selector">
      <div data-testid="current-layout">{currentLayout}</div>
      {availableLayouts?.map((layout: LayoutType) => (
        <div key={layout} data-testid={`layout-option-${layout}`}>{layout}</div>
      ))}
    </div>
  )
}));

describe('EnhancedMultiFrameContainer', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders with default layout', () => {
    render(
      <EnhancedMultiFrameContainer
        initialLayout="single"
      />
    );
    
    // Check that the container is rendered
    expect(screen.getByTestId('enhanced-multi-frame-container')).toBeInTheDocument();
    // Check that the AdvancedLayout is rendered
    expect(screen.getByTestId('advanced-layout-mock')).toBeInTheDocument();
    // Check layout type in the mocked component
    expect(screen.getByTestId('layout-type').textContent).toBe('advanced');
  });

  it('renders with saved layouts', () => {
    const savedLayouts: LayoutType[] = ['advanced', 'single', 'dual'];

    render(
      <EnhancedMultiFrameContainer
        initialLayout="dual"
        layoutOptions={savedLayouts}
      />
    );
    
    // Check that the layout selector is rendered
    expect(screen.getByTestId('layout-selector')).toBeInTheDocument();
    // Check current layout is showing
    expect(screen.getByTestId('current-layout').textContent).toBe('dual');
    // Check that layout options are displayed
    expect(screen.getByTestId('layout-option-single')).toBeInTheDocument();
    expect(screen.getByTestId('layout-option-dual')).toBeInTheDocument();
  });
}); 




