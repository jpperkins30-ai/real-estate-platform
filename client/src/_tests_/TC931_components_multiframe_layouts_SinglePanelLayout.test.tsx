// Test Case 931: Verify SinglePanelLayout renders with one panel correctly
// Test Case TC931: Verify SinglePanelLayout renders with one panel correctly
// Test Case TC999: Verify components_multiframe_layouts_SinglePanelLayout functionality
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SinglePanelLayout } from '../../src/components/multiframe/layouts/SinglePanelLayout';
import { PanelContentType } from '../../../../types/layout.types';

// Define interface for PanelContainer props
interface PanelContainerProps {
  id: string;
  title: string;
  contentType: PanelContentType | string;
  maximizable?: boolean;
  closable?: boolean;
  onStateChange?: (state: any) => void;
  onAction?: (action: any) => void;
  [key: string]: any;
}

// Create mock function for testing callbacks
const mockPanelContainer = vi.fn();

// Mock PanelContainer component
vi.mock('../../src/components/multiframe/PanelContainer', () => ({
  PanelContainer: (props: PanelContainerProps) => {
    mockPanelContainer(props);
    return (
      <div data-testid={`panel-container-${props.id}`}>
        <div data-testid="panel-title">{props.title}</div>
        <div data-testid="panel-content-type">{props.contentType}</div>
      </div>
    );
  }
}));

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

describe('SinglePanelLayout', () => {
  it('renders a panel container with the correct props', () => {
    const panels = [{
      id: 'test-panel',
      title: 'Test Panel',
      contentType: 'map' as PanelContentType,
      position: { row: 0, col: 0 },
      size: { width: 100, height: 100 }
    }];
    
    render(<SinglePanelLayout panels={panels} />);
    
    expect(screen.getByTestId('single-layout')).toBeInTheDocument();
    expect(screen.getByTestId('panel-container-test-panel')).toBeInTheDocument();
    expect(screen.getByTestId('panel-title')).toHaveTextContent('Test Panel');
    expect(screen.getByTestId('panel-content-type')).toHaveTextContent('map');
  });
  
  it('shows empty message when no panels are provided', () => {
    render(<SinglePanelLayout panels={[]} />);
    
    expect(screen.getByTestId('empty-single-layout')).toBeInTheDocument();
    expect(screen.getByText('No panel configured')).toBeInTheDocument();
  });

  it('calls onPanelStateChange when panel state changes', () => {
    const onPanelStateChange = vi.fn();
    const panels = [{
      id: 'test-panel',
      title: 'Test Panel',
      contentType: 'map' as PanelContentType,
      position: { row: 0, col: 0 },
      size: { width: 100, height: 100 }
    }];
    
    render(
      <SinglePanelLayout 
        panels={panels} 
        onPanelStateChange={onPanelStateChange}
      />
    );
    
    // Mock the PanelContainer's onStateChange callback
    const onStateChangeHandler = mockPanelContainer.mock.calls[0][0].onStateChange;
    onStateChangeHandler({ someState: 'value' });
    
    expect(onPanelStateChange).toHaveBeenCalledWith('test-panel', { someState: 'value' });
  });

  it('calls onPanelAction when panel action occurs', () => {
    const onPanelAction = vi.fn();
    const panels = [{
      id: 'test-panel',
      title: 'Test Panel',
      contentType: 'map' as PanelContentType,
      position: { row: 0, col: 0 },
      size: { width: 100, height: 100 }
    }];
    
    render(
      <SinglePanelLayout 
        panels={panels} 
        onPanelAction={onPanelAction}
      />
    );
    
    // Mock the PanelContainer's onAction callback
    const onActionHandler = mockPanelContainer.mock.calls[0][0].onAction;
    onActionHandler({ type: 'maximize' });
    
    expect(onPanelAction).toHaveBeenCalledWith('test-panel', { type: 'maximize' });
  });

  it('passes panel properties to PanelContainer', () => {
    const panels = [{
      id: 'test-panel',
      title: 'Test Panel',
      contentType: 'map' as PanelContentType,
      position: { row: 0, col: 0 },
      size: { width: 100, height: 100 },
      maximizable: true,
      closable: true
    }];
    
    render(<SinglePanelLayout panels={panels} />);
    
    // Check that the correct properties are passed to PanelContainer
    expect(mockPanelContainer).toHaveBeenCalled();
    const mockCall = mockPanelContainer.mock.calls[0][0];
    expect(mockCall.id).toBe('test-panel');
    expect(mockCall.title).toBe('Test Panel');
    expect(mockCall.contentType).toBe('map');
    expect(mockCall.className).toBe('full-size-panel');
    expect(typeof mockCall.onStateChange).toBe('function');
    expect(typeof mockCall.onAction).toBe('function');
  });
}); 




