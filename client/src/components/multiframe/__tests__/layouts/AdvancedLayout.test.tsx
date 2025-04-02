import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AdvancedLayout } from '../../layouts/AdvancedLayout';
import { AdvancedPanelConfig, PanelContentType } from '../../../types/layout.types';

// Mock react-resizable
vi.mock('react-resizable', () => ({
  Resizable: ({ children, onResize, width, height }: any) => (
    <div 
      data-testid="resizable"
      style={{ width, height }}
      onClick={() => onResize(null, { size: { width: width + 100, height: height + 100 } })}
    >
      {children}
    </div>
  ),
  ResizableHandle: () => <div data-testid="resizable-handle" />
}));

// Mock PanelContainer with proper props and test IDs
vi.mock('../../../../components/multiframe/PanelContainer', () => ({
  PanelContainer: ({ 
    id, 
    title, 
    contentType, 
    onAction, 
    maximizable, 
    closable,
    isMaximized 
  }: any) => (
    <div data-testid={`panel-container-${id}`}>
      <div data-testid={`panel-title-${id}`}>{title}</div>
      <div data-testid={`panel-content-type-${id}`}>{contentType}</div>
      
      {maximizable && (
        <button 
          data-testid={`maximize-button-${id}`}
          onClick={() => onAction?.({ type: isMaximized ? 'restore' : 'maximize', panelId: id })}
        >
          {isMaximized ? 'Restore' : 'Maximize'}
        </button>
      )}
      
      {closable && (
        <button 
          data-testid={`close-button-${id}`}
          onClick={() => onAction?.({ type: 'close', panelId: id })}
        >
          Close
        </button>
      )}
    </div>
  )
}));

const mockPanels: AdvancedPanelConfig[] = [
  {
    id: 'panel-1',
    title: 'Panel 1',
    contentType: 'map',
    position: { x: 0, y: 0, width: 50, height: 50 },
    closable: true,
    maximizable: true
  },
  {
    id: 'panel-2',
    title: 'Panel 2',
    contentType: 'stats',
    position: { x: 50, y: 0, width: 50, height: 50 },
    closable: true,
    maximizable: true
  }
];

describe('AdvancedLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders panels correctly', () => {
    render(<AdvancedLayout panels={mockPanels} />);
    
    expect(screen.getByTestId('panel-container-panel-1')).toBeInTheDocument();
    expect(screen.getByTestId('panel-container-panel-2')).toBeInTheDocument();
    expect(screen.getByTestId('panel-title-panel-1')).toHaveTextContent('Panel 1');
    expect(screen.getByTestId('panel-title-panel-2')).toHaveTextContent('Panel 2');
  });

  it('handles panel close action', () => {
    const onPanelClose = vi.fn();
    render(<AdvancedLayout panels={mockPanels} onPanelClose={onPanelClose} />);
    
    fireEvent.click(screen.getByTestId('close-button-panel-1'));
    
    expect(onPanelClose).toHaveBeenCalledWith('panel-1');
  });

  it('handles panel maximize action', () => {
    const onPanelStateChange = vi.fn();
    render(<AdvancedLayout panels={mockPanels} onPanelStateChange={onPanelStateChange} />);
    
    fireEvent.click(screen.getByTestId('maximize-button-panel-1'));
    
    expect(onPanelStateChange).toHaveBeenCalledWith('panel-1', { isMaximized: true });
  });

  it('handles panel restore action', () => {
    const onPanelStateChange = vi.fn();
    const maximizedPanels = mockPanels.map(panel => ({ ...panel, isMaximized: true }));
    render(<AdvancedLayout panels={maximizedPanels} onPanelStateChange={onPanelStateChange} />);
    
    fireEvent.click(screen.getByTestId('maximize-button-panel-1'));
    
    expect(onPanelStateChange).toHaveBeenCalledWith('panel-1', { isMaximized: false });
  });

  it('handles panel resize', () => {
    const onPanelPositionChange = vi.fn();
    render(<AdvancedLayout panels={mockPanels} onPanelPositionChange={onPanelPositionChange} />);
    
    fireEvent.click(screen.getByTestId('resizable'));
    
    expect(onPanelPositionChange).toHaveBeenCalledWith('panel-1', {
      width: 150,
      height: 150
    });
  });

  it('handles adding new panels', () => {
    const onPanelAdd = vi.fn();
    render(<AdvancedLayout panels={mockPanels} onPanelAdd={onPanelAdd} />);
    
    // Simulate adding a new panel
    const newPanel: AdvancedPanelConfig = {
      id: 'panel-3',
      title: 'Panel 3',
      contentType: 'chart',
      position: { x: 0, y: 50, width: 50, height: 50 },
      closable: true,
      maximizable: true
    };
    
    onPanelAdd(newPanel);
    
    expect(screen.getByTestId('panel-container-panel-3')).toBeInTheDocument();
    expect(screen.getByTestId('panel-title-panel-3')).toHaveTextContent('Panel 3');
  });
}); 