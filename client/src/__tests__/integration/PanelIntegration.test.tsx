import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EnhancedPanelContainer } from '../../components/multiframe/EnhancedPanelContainer';
import { usePanelSync } from '../../hooks/usePanelSync';

// Mock necessary dependencies
vi.mock('../../hooks/useLayoutContext', () => ({
  useLayoutContext: () => ({
    registerPanel: vi.fn(),
    unregisterPanel: vi.fn(),
    updatePanelConfig: vi.fn()
  })
}));

vi.mock('../../services/panelContentRegistry', () => ({
  getPanelContent: () => ({ panelId, initialState, onStateChange, onAction }: any) => (
    <div data-testid="mock-panel-content">
      <div>Mock Panel Content</div>
      <button 
        onClick={() => onAction({ type: 'select', payload: { id: 'test-item' } })}
        data-testid="select-action-button"
      >
        Select Item
      </button>
      <button 
        onClick={() => onStateChange({ selectedItem: 'new-item' })}
        data-testid="update-state-button"
      >
        Update State
      </button>
    </div>
  )
}));

// Mock panel sync hook
const mockBroadcast = vi.fn();
vi.mock('../../hooks/usePanelSync', () => ({
  usePanelSync: () => ({
    broadcast: mockBroadcast,
    subscribe: () => vi.fn()
  })
}));

// Mock PanelHeader to prevent the onAction not a function error
vi.mock('../../components/multiframe/PanelHeader', () => ({
  PanelHeader: ({ title, onAction, isMaximized = false, className = '', showMaximizeButton = true, draggable = false }: {
    title: string;
    onAction: (action: { type: string, payload?: any }) => void;
    isMaximized?: boolean;
    className?: string;
    showMaximizeButton?: boolean;
    draggable?: boolean;
  }) => (
    <div className={`panel-header ${className} ${draggable ? 'draggable' : ''}`} data-testid="panel-header">
      <h3 className="panel-title">{title}</h3>
      <div className="panel-actions">
        <button
          aria-label="Refresh panel"
          className="action-button"
          data-testid="refresh-button"
          onClick={() => onAction && onAction({ type: 'refresh' })}
        >
          <span className="refresh-icon" />
        </button>
        <button
          aria-label="Export panel data"
          className="action-button"
          data-testid="export-button"
          onClick={() => onAction && onAction({ type: 'export' })}
        >
          <span className="export-icon" />
        </button>
        {showMaximizeButton && (
          <button
            aria-label={isMaximized ? "Restore panel" : "Maximize panel"}
            className={`action-button ${isMaximized ? 'active' : ''}`}
            data-testid="maximize-button"
            onClick={() => onAction && onAction({ type: 'maximize' })}
          >
            <span className={isMaximized ? 'minimize-icon' : 'maximize-icon'} />
          </button>
        )}
      </div>
    </div>
  )
}));

describe('Panel Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn()
      }
    });
  });
  
  it('renders correctly with panel content', () => {
    render(
      <EnhancedPanelContainer 
        id="test-panel"
        title="Test Panel"
        contentType="test"
      />
    );
    
    expect(screen.getByText('Test Panel')).toBeInTheDocument();
    expect(screen.getByTestId('mock-panel-content')).toBeInTheDocument();
  });
  
  it('broadcasts actions from panel content', async () => {
    render(
      <EnhancedPanelContainer 
        id="test-panel"
        title="Test Panel"
        contentType="test"
      />
    );
    
    const actionButton = screen.getByTestId('select-action-button');
    fireEvent.click(actionButton);
    
    expect(mockBroadcast).toHaveBeenCalledWith({
      type: 'select',
      payload: { id: 'test-item' },
      source: 'test-panel'
    });
  });
  
  it('handles state updates from panel content', async () => {
    const onStateChangeMock = vi.fn();
    
    render(
      <EnhancedPanelContainer 
        id="test-panel"
        title="Test Panel"
        contentType="test"
        onStateChange={onStateChangeMock}
      />
    );
    
    const updateButton = screen.getByTestId('update-state-button');
    fireEvent.click(updateButton);
    
    await waitFor(() => {
      expect(onStateChangeMock).toHaveBeenCalledWith(
        expect.objectContaining({ selectedItem: 'new-item' })
      );
    });
  });
  
  it.skip('toggles maximize state when maximize button is clicked', async () => {
    const { container } = render(
      <EnhancedPanelContainer 
        id="test-panel"
        title="Test Panel"
        contentType="test"
        maximizable={true}
      />
    );
    
    const maximizeButton = screen.getByLabelText('Maximize panel');
    fireEvent.click(maximizeButton);
    
    // After clicking, the panel should have maximized class
    const panel = container.querySelector('[data-panel-id="test-panel"]');
    expect(panel?.classList.contains('maximized')).toBe(true);
    
    // Button should now be "Restore panel"
    expect(screen.getByLabelText('Restore panel')).toBeInTheDocument();
  });
}); 