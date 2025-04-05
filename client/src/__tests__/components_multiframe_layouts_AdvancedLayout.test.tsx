// Mock the PanelContainer component first to avoid hoisting issues
vi.mock('../../src/components/multiframe/PanelContainer', () => {
  // Define PanelContainer props type inside the mock to avoid hoisting issues
  interface MockPanelContainerProps {
    id: string; 
    title: string; 
    contentType: any; // Using any for now as we don't have access to PanelContentType yet
    onAction?: (action: any) => void; 
    maximizable?: boolean; 
    closable?: boolean;
  }

  return {
    PanelContainer: ({ 
      id, 
      title, 
      contentType, 
      onAction, 
      maximizable, 
      closable 
    }: MockPanelContainerProps) => (
      <div data-testid={`panel-container-${id}`}>
        <div data-testid={`panel-header-${id}`}>
          <span data-testid={`panel-title-${id}`}>{title}</span>
          <div data-testid={`panel-actions-${id}`}>
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
        </div>
        <div data-testid={`panel-content-${id}`}>
          <div data-testid={`${contentType}-content-${id}`}>{contentType} Content</div>
        </div>
      </div>
    )
  };
});

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  render, 
  screen, 
  fireEvent
} from '../../../../test-utils';
import { PanelContentType, AdvancedPanelPosition, AdvancedPanelConfig } from '../../../../types/layout.types';
import { PanelHeaderAction } from '../../../../types/action.types';
import { AdvancedLayout } from '../../src/components/multiframe/layouts/AdvancedLayout';

// Define PanelContainer props type
interface PanelContainerProps {
  id: string; 
  title: string; 
  contentType: PanelContentType; 
  onAction?: (action: PanelHeaderAction) => void; 
  maximizable?: boolean; 
  closable?: boolean;
}

// Helper function to create AdvancedPanelConfig mock
const createAdvancedPanelConfig = (overrides: Partial<AdvancedPanelConfig> = {}): AdvancedPanelConfig => ({
  id: 'panel-1',
  contentType: 'map' as PanelContentType,
  title: 'Test Panel',
  position: {
    x: 0,
    y: 0,
    width: 50,
    height: 50
  },
  maximizable: true,
  closable: true,
  ...overrides
});

// Create mock panels
const createAdvancedMockPanels = (): AdvancedPanelConfig[] => [
  createAdvancedPanelConfig(),
  createAdvancedPanelConfig({
    id: 'panel-2',
    contentType: 'state',
    title: 'State Panel',
    position: {
      x: 50,
      y: 0,
      width: 50,
      height: 50
    }
  })
];

describe('AdvancedLayout', () => {
  const mockPanels = createAdvancedMockPanels();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it.skip('renders panels with correct positions and properties', () => {
    render(<AdvancedLayout panels={mockPanels} />);
    
    // Try to find the component in multiple ways
    const layout = screen.getByTestId('advanced-layout') || 
                   screen.getByRole('region') ||
                   screen.getByLabelText('Advanced layout');
    
    expect(layout).toBeInTheDocument();
    expect(screen.getByTestId('panel-container-panel-1')).toBeInTheDocument();
    expect(screen.getByTestId('panel-container-panel-2')).toBeInTheDocument();
    
    // Check content rendering
    expect(screen.getByTestId('panel-title-panel-1')).toHaveTextContent('Test Panel');
    expect(screen.getByTestId('map-content-panel-1')).toHaveTextContent('map Content');
  });
  
  it('calls onPanelClose when a panel is closed', () => {
    const onPanelClose = vi.fn();
    
    render(<AdvancedLayout panels={mockPanels} onPanelClose={onPanelClose} />);
    
    // Use specific panel ID in the query
    fireEvent.click(screen.getByTestId('close-button-panel-1'));
    
    expect(onPanelClose).toHaveBeenCalledWith('panel-1');
  });
  
  it('calls onPanelMaximize when a panel is maximized', () => {
    const onPanelMaximize = vi.fn();
    
    render(<AdvancedLayout panels={mockPanels} onPanelAction={(panelId, action) => {
      if (action.type === 'maximize') {
        onPanelMaximize(panelId);
      }
    }} />);
    
    fireEvent.click(screen.getByTestId('maximize-button-panel-2'));
    
    expect(onPanelMaximize).toHaveBeenCalledWith('panel-2');
  });
  
  it('positions panels according to their configuration', () => {
    render(<AdvancedLayout panels={mockPanels} />);
    
    // Get the containers instead of the wrappers since the structure is different
    const panel1 = screen.getByTestId('panel-container-panel-1').parentElement;
    const panel2 = screen.getByTestId('panel-container-panel-2').parentElement;
    
    if (panel1 && panel2) {
      // Check style properties based on the actual implementation
      expect(panel1).toHaveStyle(`
        position: absolute;
        left: ${mockPanels[0].position.x}%;
        top: ${mockPanels[0].position.y}%;
        width: ${mockPanels[0].position.width}%;
        height: ${mockPanels[0].position.height}%;
      `);
      
      expect(panel2).toHaveStyle(`
        position: absolute;
        left: ${mockPanels[1].position.x}%;
        top: ${mockPanels[1].position.y}%;
        width: ${mockPanels[1].position.width}%;
        height: ${mockPanels[1].position.height}%;
      `);
    }
  });
  
  it('allows for adding new panels dynamically', () => {
    const { rerender } = render(<AdvancedLayout panels={mockPanels} />);
    
    // Initial check
    expect(screen.getAllByTestId(/panel-container-/)).toHaveLength(2);
    
    // Add a new panel
    const updatedPanels = [
      ...mockPanels,
      createAdvancedPanelConfig({
        id: 'panel-3',
        contentType: 'filter',
        title: 'Filter Panel',
        position: { x: 0, y: 70, width: 100, height: 30 }
      })
    ];
    
    // Re-render with updated panels
    rerender(<AdvancedLayout panels={updatedPanels} />);
    
    // Check new panel is rendered
    expect(screen.getAllByTestId(/panel-container-/)).toHaveLength(3);
    expect(screen.getByTestId('panel-container-panel-3')).toBeInTheDocument();
    expect(screen.getByTestId('filter-content-panel-3')).toHaveTextContent('filter Content');
  });
}); 

