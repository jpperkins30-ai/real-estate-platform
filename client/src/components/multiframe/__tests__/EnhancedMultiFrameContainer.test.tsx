import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EnhancedMultiFrameContainer } from '../EnhancedMultiFrameContainer';
import { LayoutType, PanelConfig, PanelContentType, AdvancedPanelConfig } from '../../../types/layout.types';

// Mock AdvancedLayout
vi.mock('../layouts/AdvancedLayout', () => ({
  AdvancedLayout: ({ 
    panels, 
    onPositionChange, 
    onStateChange, 
    onClose, 
    onAdd,
  }: { 
    panels: AdvancedPanelConfig[];
    onPositionChange?: (id: string, position: { x: number; y: number; width: number; height: number }) => void;
    onStateChange?: (id: string, state: Record<string, unknown>) => void;
    onClose?: (id: string) => void;
    onAdd?: (panel: AdvancedPanelConfig) => void;
  }) => (
    <div data-testid="advanced-layout-mock">
      <button 
        onClick={() => onPositionChange?.('panel-1', { x: 10, y: 10, width: 50, height: 50 })}
        data-testid="test-position-change"
      >
        Change Position
      </button>
      <button 
        onClick={() => onStateChange?.('panel-1', { test: 'state' })}
        data-testid="test-state-change"
      >
        Change State
      </button>
      <button 
        onClick={() => onClose?.('panel-1')}
        data-testid="test-panel-close"
      >
        Close Panel
      </button>
      <button 
        onClick={() => onAdd?.({
          id: 'new-panel',
          contentType: 'map' as PanelContentType,
          title: 'New Panel',
          position: { x: 20, y: 20, width: 30, height: 30 },
          maximizable: true,
          closable: true
        })}
        data-testid="test-panel-add"
      >
        Add Panel
      </button>
      <div data-testid="panels-count">{panels.length}</div>
    </div>
  )
}));

// Mock LayoutSelector
vi.mock('../controls/LayoutSelector', () => ({
  LayoutSelector: ({ 
    currentLayout, 
    onLayoutChange, 
    availableLayouts 
  }: { 
    currentLayout: LayoutType;
    onLayoutChange: (layout: LayoutType) => void;
    availableLayouts?: LayoutType[];
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

  it('renders with advanced layout by default', () => {
    render(<EnhancedMultiFrameContainer />);
    
    expect(screen.getByTestId('enhanced-multi-frame-container')).toBeInTheDocument();
    expect(screen.getByTestId('advanced-layout-mock')).toBeInTheDocument();
  });
  
  it('allows panel position changes', () => {
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
  
  it('handles panel state changes', () => {
    const onPanelStateChange = vi.fn();
    
    render(
      <EnhancedMultiFrameContainer
        onPanelStateChange={onPanelStateChange}
      />
    );
    
    fireEvent.click(screen.getByTestId('test-state-change'));
    
    expect(onPanelStateChange).toHaveBeenCalledWith('panel-1', { test: 'state' });
  });
  
  it('handles panel closing', () => {
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
  
  it('handles adding new panels', () => {
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
  
  it('hides layout selector when specified', () => {
    render(
      <EnhancedMultiFrameContainer
        showLayoutSelector={false}
      />
    );
    
    expect(screen.queryByTestId('layout-selector-mock')).not.toBeInTheDocument();
  });

  it('initializes with provided panels', () => {
    const initialPanels: AdvancedPanelConfig[] = [
      {
        id: 'panel-1',
        contentType: 'map' as PanelContentType,
        title: 'Map Panel',
        position: { x: 0, y: 0, width: 50, height: 50 },
        maximizable: true,
        closable: true
      }
    ];
    
    render(
      <EnhancedMultiFrameContainer
        panels={initialPanels}
      />
    );
    
    expect(screen.getByTestId('advanced-layout-mock')).toBeInTheDocument();
  });
}); 