import React, { useEffect } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PanelSyncProvider, usePanelSync, PanelSyncEvent } from '../../context/PanelSyncContext';

// Test component that uses panel sync context to broadcast
const TestBroadcaster = ({ 
  eventData,
  testId = 'test-broadcaster'
}: { 
  eventData: Omit<PanelSyncEvent, 'timestamp'>,
  testId?: string
}) => {
  const { broadcast } = usePanelSync();
  
  return (
    <button 
      data-testid={testId} 
      onClick={() => broadcast(
        eventData.type, 
        eventData.payload, 
        eventData.source
      )}
    >
      Broadcast
    </button>
  );
};

// Test component that subscribes to events
const TestListener = ({ 
  onEvent,
  testId = 'test-listener'
}: { 
  onEvent: (event: PanelSyncEvent) => void,
  testId?: string
}) => {
  const { subscribe } = usePanelSync();
  
  useEffect(() => {
    const unsubscribe = subscribe(onEvent);
    return unsubscribe;
  }, [subscribe, onEvent]);
  
  return <div data-testid={testId}>Listening for events</div>;
};

describe('PanelSyncContext', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('provides context to children', () => {
    render(
      <PanelSyncProvider>
        <TestListener onEvent={() => {}} />
      </PanelSyncProvider>
    );
    
    expect(screen.getByTestId('test-listener')).toBeInTheDocument();
  });

  it('throws error when used outside Provider', () => {
    // Mock console.error to avoid test output noise
    const consoleError = console.error;
    console.error = vi.fn();
    
    expect(() => {
      render(<TestListener onEvent={() => {}} />);
    }).toThrow('usePanelSync must be used within a PanelSyncProvider');
    
    // Restore console.error
    console.error = consoleError;
  });

  it('broadcasts events to subscribers', async () => {
    const mockCallback = vi.fn();
    
    render(
      <PanelSyncProvider>
        <TestListener onEvent={mockCallback} />
        <TestBroadcaster 
          eventData={{ 
            type: 'test-event', 
            payload: { value: 'test' }, 
            source: 'test-source' 
          }}
        />
      </PanelSyncProvider>
    );
    
    // Click the broadcast button
    fireEvent.click(screen.getByTestId('test-broadcaster'));
    
    // Check if the callback was called with the correct event
    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalledTimes(1);
      
      const event = mockCallback.mock.calls[0][0];
      expect(event.type).toBe('test-event');
      expect(event.payload).toEqual({ value: 'test' });
      expect(event.source).toBe('test-source');
      expect(event.timestamp).toBeDefined();
    });
  });

  it('allows unsubscribing from events', async () => {
    const mockCallback = vi.fn();
    
    // Component that can unsubscribe
    const UnsubscribingComponent = () => {
      const { subscribe, broadcast } = usePanelSync();
      const [isSubscribed, setIsSubscribed] = React.useState(true);
      
      useEffect(() => {
        let unsubscribe = () => {};
        
        if (isSubscribed) {
          unsubscribe = subscribe(mockCallback);
        }
        
        return unsubscribe;
      }, [subscribe, isSubscribed]);
      
      return (
        <div>
          <button 
            data-testid="unsubscribe-button" 
            onClick={() => setIsSubscribed(false)}
          >
            Unsubscribe
          </button>
          <button 
            data-testid="broadcast-button" 
            onClick={() => broadcast('test', 'test', 'test')}
          >
            Broadcast
          </button>
        </div>
      );
    };
    
    render(
      <PanelSyncProvider>
        <UnsubscribingComponent />
      </PanelSyncProvider>
    );
    
    // First broadcast, callback should be called
    fireEvent.click(screen.getByTestId('broadcast-button'));
    expect(mockCallback).toHaveBeenCalledTimes(1);
    
    // Unsubscribe
    fireEvent.click(screen.getByTestId('unsubscribe-button'));
    
    // Reset mock
    mockCallback.mockReset();
    
    // Second broadcast, callback should not be called
    fireEvent.click(screen.getByTestId('broadcast-button'));
    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('maintains event history', async () => {
    // Component to check event history
    const HistoryChecker = () => {
      const { getEventHistory, broadcast } = usePanelSync();
      const [history, setHistory] = React.useState<PanelSyncEvent[]>([]);
      
      const broadcastEvent = (id: number) => {
        broadcast(
          'test-event',
          { id },
          'history-test'
        );
      };
      
      const checkHistory = () => {
        setHistory(getEventHistory());
      };
      
      return (
        <div>
          <button 
            data-testid="broadcast-1" 
            onClick={() => broadcastEvent(1)}
          >
            Broadcast 1
          </button>
          <button 
            data-testid="broadcast-2" 
            onClick={() => broadcastEvent(2)}
          >
            Broadcast 2
          </button>
          <button 
            data-testid="check-history" 
            onClick={checkHistory}
          >
            Check History
          </button>
          <div data-testid="history-length">{history.length}</div>
          {history.length > 0 && (
            <div data-testid="latest-event-id">
              {history[0].payload.id}
            </div>
          )}
        </div>
      );
    };
    
    render(
      <PanelSyncProvider>
        <HistoryChecker />
      </PanelSyncProvider>
    );
    
    // Broadcast first event
    fireEvent.click(screen.getByTestId('broadcast-1'));
    
    // Broadcast second event
    fireEvent.click(screen.getByTestId('broadcast-2'));
    
    // Check history
    fireEvent.click(screen.getByTestId('check-history'));
    
    // Should have 2 events, with the latest one first
    expect(screen.getByTestId('history-length').textContent).toBe('2');
    expect(screen.getByTestId('latest-event-id').textContent).toBe('2');
  });

  it('handles errors in subscribers gracefully', async () => {
    // Mock console.error
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    const goodCallback = vi.fn();
    const badCallback = vi.fn().mockImplementation(() => {
      throw new Error('Intentional error in subscriber');
    });
    
    render(
      <PanelSyncProvider>
        <TestListener testId="good-listener" onEvent={goodCallback} />
        <TestListener testId="bad-listener" onEvent={badCallback} />
        <TestBroadcaster 
          eventData={{ 
            type: 'test-event', 
            payload: 'test', 
            source: 'test-source' 
          }}
        />
      </PanelSyncProvider>
    );
    
    // Broadcast event
    fireEvent.click(screen.getByTestId('test-broadcaster'));
    
    // Both callbacks should be called
    expect(badCallback).toHaveBeenCalled();
    expect(goodCallback).toHaveBeenCalled();
    
    // Error should be logged
    expect(console.error).toHaveBeenCalled();
    
    // Restore console.error
    console.error = originalConsoleError;
  });
}); 