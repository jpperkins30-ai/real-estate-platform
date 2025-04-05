// Test Case 201: Verify MultiFrameContainer renders with default layout
// Test Case TC201: Verify MultiFrameContainer renders with default layout
// Test Case TC201: Verify MultiFrameContainer renders with default layout
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EnhancedMultiFrameContainer } from '../../src/components/multiframe/EnhancedMultiFrameContainer';

// Mock AdvancedLayout
vi.mock('../../src/components/multiframe/layouts/AdvancedLayout', () => ({
  AdvancedLayout: ({ 
    panels, 
    onPanelPositionChange, 
    onPanelStateChange, 
    onPanelClose, 
    onPanelAdd 
  }: {
    panels: any[];
    onPanelPositionChange?: (id: string, position: any) => void;
    onPanelStateChange?: (id: string, state: any) => void;
    onPanelClose?: (id: string) => void;
    onPanelAdd?: (panel: any) => void;
  }) => (
    <div data-testid="advanced-layout-mock">
      <button 
        onClick={() => onPanelPositionChange?.('panel-1', { x: 10, y: 10, width: 50, height: 50 })}
        data-testid="test-position-change"
      >
        Change Position
      </button>
      <button 
        onClick={() => onPanelStateChange?.('panel-1', { test: 'state' })}
        data-testid="test-state-change"
      >
        Change State
      </button>
      <button 
        onClick={() => onPanelClose?.('panel-1')}
        data-testid="test-panel-close"
      >
        Close Panel
      </button>
      <button 
        onClick={() => onPanelAdd?.({
          id: 'new-panel',
          contentType: 'map',
          title: 'New Panel',
          position: { x: 20, y: 20, width: 30, height: 30 },
          maximizable: true,
          closable: true
        })}
        data-testid="test-panel-add"
      >
        Add Panel
      </button>
    </div>
  )
}));

// Mock LayoutSelector
vi.mock('../../src/components/multiframe/controls/LayoutSelector', () => ({
  LayoutSelector: ({ 
    currentLayout, 
    onLayoutChange, 
    availableLayouts 
  }: {
    currentLayout: string;
    onLayoutChange: (layout: string) => void;
    availableLayouts?: string[];
  }) => (
    <div data-testid="layout-selector-mock">
      {availableLayouts?.map(layout => (
        <button 
          key={layout}
          onClick={() => onLayoutChange(layout)}
          data-testid={`select-${layout}`}
        >
          {layout}
        </button>
      ))}
      <div>Current: {currentLayout}</div>
    </div>
  )
}));

describe('EnhancedMultiFrameContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('TC501: should render with advanced layout by default', () => {
    render(<EnhancedMultiFrameContainer />);
    
    expect(screen.getByTestId('enhanced-multi-frame-container')).toBeInTheDocument();
    expect(screen.getByTestId('advanced-layout-mock')).toBeInTheDocument();
  });
  
  it('TC502: should allow panel position changes', () => {
    const onLayoutChange = vi.fn();
    
    render(
      <EnhancedMultiFrameContainer
        onLayoutChange={onLayoutChange}
      />
    );
    
    fireEvent.click(screen.getByTestId('test-position-change'));
    
    expect(onLayoutChange).toHaveBeenCalledWith(expect.objectContaining({
      type: 'advanced',
      panels: expect.arrayContaining([
        expect.objectContaining({
          id: 'panel-1',
          position: { x: 10, y: 10, width: 50, height: 50 }
        })
      ])
    }));
  });
  
  it('TC503: should handle panel state changes', () => {
    const onPanelStateChange = vi.fn();
    
    render(
      <EnhancedMultiFrameContainer
        onPanelStateChange={onPanelStateChange}
      />
    );
    
    fireEvent.click(screen.getByTestId('test-state-change'));
    
    expect(onPanelStateChange).toHaveBeenCalledWith('panel-1', { test: 'state' });
  });
  
  it('TC504: should handle panel closing', () => {
    const onPanelClose = vi.fn();
    const onLayoutChange = vi.fn();
    
    render(
      <EnhancedMultiFrameContainer
        onPanelClose={onPanelClose}
        onLayoutChange={onLayoutChange}
      />
    );
    
    fireEvent.click(screen.getByTestId('test-panel-close'));
    
    expect(onPanelClose).toHaveBeenCalledWith('panel-1');
    expect(onLayoutChange).toHaveBeenCalled(); // Should also update layout
  });
  
  it('TC505: should handle adding new panels', () => {
    const onPanelAdd = vi.fn();
    const onLayoutChange = vi.fn();
    
    render(
      <EnhancedMultiFrameContainer
        onPanelAdd={onPanelAdd}
        onLayoutChange={onLayoutChange}
      />
    );
    
    fireEvent.click(screen.getByTestId('test-panel-add'));
    
    expect(onPanelAdd).toHaveBeenCalledWith(expect.objectContaining({
      id: 'new-panel',
      contentType: 'map',
      position: { x: 20, y: 20, width: 30, height: 30 }
    }));
    expect(onLayoutChange).toHaveBeenCalled(); // Should also update layout
  });
  
  it('TC506: should hide layout selector when specified', () => {
    render(
      <EnhancedMultiFrameContainer
        showLayoutSelector={false}
      />
    );
    
    expect(screen.queryByTestId('layout-selector-mock')).not.toBeInTheDocument();
  });
}); 


