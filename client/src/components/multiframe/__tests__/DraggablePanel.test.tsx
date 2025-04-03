import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DraggablePanel } from '../DraggablePanel';

// Mock the localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    })
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('DraggablePanel Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it('renders with default props', () => {
    render(
      <DraggablePanel id="test-panel" title="Test Panel" contentType="map">
        <div>Panel Content</div>
      </DraggablePanel>
    );
    
    expect(screen.getByText('Test Panel')).toBeInTheDocument();
    expect(screen.getByText('Panel Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <DraggablePanel 
        id="test-panel" 
        title="Test Panel" 
        contentType="map" 
        className="custom-class"
      >
        <div>Panel Content</div>
      </DraggablePanel>
    );
    
    const panel = screen.getByTestId('panel-test-panel');
    expect(panel.className).toContain('custom-class');
  });

  it('handles maximize action', () => {
    const onActionMock = vi.fn();
    
    render(
      <DraggablePanel 
        id="test-panel" 
        title="Test Panel" 
        contentType="map"
        onAction={onActionMock}
      >
        <div>Panel Content</div>
      </DraggablePanel>
    );
    
    const maximizeButton = screen.getByLabelText('Maximize');
    fireEvent.click(maximizeButton);
    
    expect(onActionMock).toHaveBeenCalledWith({ type: 'maximize' });
    
    // Check that localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'panel-test-panel-maximized',
      expect.any(String)
    );
  });

  it('handles close action', () => {
    const onActionMock = vi.fn();
    
    render(
      <DraggablePanel 
        id="test-panel" 
        title="Test Panel" 
        contentType="map"
        onAction={onActionMock}
      >
        <div>Panel Content</div>
      </DraggablePanel>
    );
    
    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);
    
    expect(onActionMock).toHaveBeenCalledWith({ type: 'close' });
  });

  it('restores state from localStorage', async () => {
    // Set up mock localStorage data
    const savedState = {
      position: { x: 100, y: 200 },
      size: { width: 500, height: 400 }
    };
    
    // Setup the localStorage mock to return our savedState for the specific key
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));
    
    const onStateChangeMock = vi.fn();
    
    render(
      <DraggablePanel 
        id="test-panel" 
        title="Test Panel" 
        contentType="map"
        onStateChange={onStateChangeMock}
      >
        <div>Panel Content</div>
      </DraggablePanel>
    );
    
    // Check that localStorage was queried
    expect(localStorageMock.getItem).toHaveBeenCalledWith('panel-test-panel-state');
    
    // We need to wait for the useEffect to run and call onStateChange
    await waitFor(() => {
      expect(onStateChangeMock).toHaveBeenCalledWith(savedState);
    });
  });

  it('disables dragging when draggable=false', () => {
    render(
      <DraggablePanel 
        id="test-panel" 
        title="Test Panel" 
        contentType="map"
        draggable={false}
      >
        <div>Panel Content</div>
      </DraggablePanel>
    );
    
    const header = screen.getByText('Test Panel').closest('.panel-header');
    expect(header).not.toHaveAttribute('onMouseDown');
  });

  it('hides resize handles when resizable=false', () => {
    render(
      <DraggablePanel 
        id="test-panel" 
        title="Test Panel" 
        contentType="map"
        resizable={false}
      >
        <div>Panel Content</div>
      </DraggablePanel>
    );
    
    expect(screen.queryByTestId('resize-handle-se')).not.toBeInTheDocument();
  });
}); 