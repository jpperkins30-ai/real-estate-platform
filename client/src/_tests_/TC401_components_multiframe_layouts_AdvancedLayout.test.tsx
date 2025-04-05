// Test Case 401: Verify AdvancedLayout renders panels with correct positions
// Test Case TC401: Verify AdvancedLayout renders panels with correct positions
// Test Case TC401: Verify AdvancedLayout renders panels with correct positions
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AdvancedLayout } from '../../src/components/multiframe/layouts/AdvancedLayout';
import { AdvancedPanelConfig } from '../../src/types/layout.types';

// Mock react-resizable
vi.mock('react-resizable', () => ({
  Resizable: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock PanelContainer component
vi.mock('../../src/components/multiframe/PanelContainer', () => ({
  PanelContainer: ({ 
    id, 
    title, 
    contentType,
    onAction,
    maximizable,
    closable
  }: { 
    id: string; 
    title: string; 
    contentType: string;
    onAction?: (action: any) => void;
    maximizable?: boolean;
    closable?: boolean;
    [key: string]: any;
  }) => (
    <div data-testid={`panel-container-${id}`}>
      <div data-testid={`panel-title-${id}`}>{title}</div>
      <div data-testid={`panel-content-type-${id}`}>{contentType}</div>
      
      {maximizable && (
        <button 
          data-testid={`maximize-button-${id}`}
          onClick={() => onAction?.({ type: 'maximize' })}
        >
          Maximize
        </button>
      )}
      
      {closable && (
        <button 
          data-testid={`close-button-${id}`}
          onClick={() => onAction?.({ type: 'close' })}
        >
          Close
        </button>
      )}
    </div>
  )
}));

describe('AdvancedLayout', () => {
  const mockPanels: AdvancedPanelConfig[] = [
    {
      id: 'panel-1',
      contentType: 'map',
      title: 'Map Panel',
      position: { x: 0, y: 0, width: 70, height: 70 },
      maximizable: true,
      closable: true
    },
    {
      id: 'panel-2',
      contentType: 'property',
      title: 'Property Panel',
      position: { x: 70, y: 0, width: 30, height: 70 },
      maximizable: true,
      closable: true
    }
  ];
  
  it('TC401: should render panels with correct positions and properties', () => {
    render(<AdvancedLayout panels={mockPanels} />);
    
    expect(screen.getByTestId('advanced-layout')).toBeInTheDocument();
    expect(screen.getByTestId('panel-container-panel-1')).toBeInTheDocument();
    expect(screen.getByTestId('panel-container-panel-2')).toBeInTheDocument();
    expect(screen.getByTestId('panel-title-panel-1')).toHaveTextContent('Map Panel');
    expect(screen.getByTestId('panel-title-panel-2')).toHaveTextContent('Property Panel');
  });
  
  it('TC402: should call onPanelClose when a panel is closed', () => {
    const onPanelClose = vi.fn();
    
    render(<AdvancedLayout panels={mockPanels} onPanelClose={onPanelClose} />);
    
    // Use specific panel ID in the query
    fireEvent.click(screen.getByTestId('close-button-panel-1'));
    
    expect(onPanelClose).toHaveBeenCalledWith('panel-1');
  });
  
  it('TC403: should show add panel button when onPanelAdd is provided', () => {
    const onPanelAdd = vi.fn();
    
    render(<AdvancedLayout panels={mockPanels} onPanelAdd={onPanelAdd} />);
    
    const addButton = screen.getByTestId('add-panel-button');
    expect(addButton).toBeInTheDocument();
    
    fireEvent.click(addButton);
    
    expect(onPanelAdd).toHaveBeenCalledWith(expect.objectContaining({
      contentType: 'map',
      title: 'New Panel',
      maximizable: true,
      closable: true
    }));
  });
}); 




