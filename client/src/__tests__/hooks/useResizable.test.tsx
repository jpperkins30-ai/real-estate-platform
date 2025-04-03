import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useResizable } from '../../hooks/useResizable';

describe('useResizable hook', () => {
  // Mock document methods
  const originalAddEventListener = document.addEventListener;
  const originalRemoveEventListener = document.removeEventListener;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock document event listeners
    document.addEventListener = vi.fn();
    document.removeEventListener = vi.fn();
  });
  
  afterEach(() => {
    // Restore original methods
    document.addEventListener = originalAddEventListener;
    document.removeEventListener = originalRemoveEventListener;
  });
  
  // Mock getBoundingClientRect
  const mockRect = {
    left: 0,
    top: 0,
    width: 100,
    height: 100,
    right: 100,
    bottom: 100,
  };
  
  const mockElement = {
    getBoundingClientRect: vi.fn().mockReturnValue(mockRect),
    parentElement: {
      getBoundingClientRect: vi.fn().mockReturnValue({
        ...mockRect,
        width: 500,
        height: 500,
      }),
    },
  } as unknown as HTMLDivElement;

  it('initializes with the provided size', () => {
    const initialSize = { width: 300, height: 200 };
    const { result } = renderHook(() => useResizable(initialSize));
    
    expect(result.current.size).toEqual(initialSize);
    expect(result.current.isResizing).toBe(false);
  });
  
  it('changes isResizing state on resize start', () => {
    const { result } = renderHook(() => useResizable());
    
    // Set ref.current
    Object.defineProperty(result.current.ref, 'current', {
      value: mockElement,
      writable: true
    });
    
    // Simulate resize start
    act(() => {
      const mockEvent = {
        clientX: 100,
        clientY: 100,
        preventDefault: vi.fn(),
        nativeEvent: {} as MouseEvent,
      };
      
      result.current.handleResizeStart(mockEvent as any, 'corner');
    });
    
    expect(result.current.isResizing).toBe(true);
  });

  it('updates size during resize', () => {
    const { result } = renderHook(() => useResizable({ width: 100, height: 100 }));
    
    // Set ref.current
    Object.defineProperty(result.current.ref, 'current', {
      value: mockElement,
      writable: true
    });
    
    // Start resizing
    act(() => {
      const mockEvent = {
        clientX: 100,
        clientY: 100,
        preventDefault: vi.fn(),
        nativeEvent: {} as MouseEvent,
      };
      
      result.current.handleResizeStart(mockEvent as any, 'corner');
    });
    
    // Capture the mousemove handler
    let mouseMoveHandler: (e: MouseEvent) => void;
    expect(document.addEventListener).toHaveBeenCalled();
    
    const addEventListenerCalls = (document.addEventListener as any).mock.calls;
    for (const call of addEventListenerCalls) {
      if (call[0] === 'mousemove') {
        mouseMoveHandler = call[1];
        break;
      }
    }
    
    // Simulate mouse move
    act(() => {
      // @ts-ignore - we know this exists
      mouseMoveHandler({
        clientX: 200,
        clientY: 200,
      } as MouseEvent);
    });
    
    // The new size should be 200x200 (original 100x100 + delta 100x100)
    expect(result.current.size.width).toBe(200);
    expect(result.current.size.height).toBe(200);
  });

  it('respects minimum size constraints', () => {
    const { result } = renderHook(() => useResizable(
      { width: 100, height: 100 },
      { minWidth: 50, minHeight: 50 }
    ));
    
    // Set ref.current
    Object.defineProperty(result.current.ref, 'current', {
      value: mockElement,
      writable: true
    });
    
    // Start resizing
    act(() => {
      const mockEvent = {
        clientX: 100,
        clientY: 100,
        preventDefault: vi.fn(),
        nativeEvent: {} as MouseEvent,
      };
      
      result.current.handleResizeStart(mockEvent as any, 'corner');
    });
    
    // Capture the mousemove handler
    let mouseMoveHandler: (e: MouseEvent) => void;
    const addEventListenerCalls = (document.addEventListener as any).mock.calls;
    for (const call of addEventListenerCalls) {
      if (call[0] === 'mousemove') {
        mouseMoveHandler = call[1];
        break;
      }
    }
    
    // Simulate mouse move to make size smaller
    act(() => {
      // @ts-ignore - we know this exists
      mouseMoveHandler({
        clientX: 20,
        clientY: 20,
      } as MouseEvent);
    });
    
    // Size should be limited to minWidth/minHeight
    expect(result.current.size.width).toBe(50);
    expect(result.current.size.height).toBe(50);
  });

  it('handles different resize directions', () => {
    const { result } = renderHook(() => useResizable({ width: 100, height: 100 }));
    
    // Set ref.current
    Object.defineProperty(result.current.ref, 'current', {
      value: mockElement,
      writable: true
    });
    
    // Test right direction
    act(() => {
      const mockEvent = {
        clientX: 100,
        clientY: 100,
        preventDefault: vi.fn(),
        nativeEvent: {} as MouseEvent,
      };
      
      result.current.handleResizeStart(mockEvent as any, 'right');
    });
    
    // Capture the mousemove handler for right direction
    let mouseMoveHandler: (e: MouseEvent) => void;
    let addEventListenerCalls = (document.addEventListener as any).mock.calls;
    for (const call of addEventListenerCalls) {
      if (call[0] === 'mousemove') {
        mouseMoveHandler = call[1];
        break;
      }
    }
    
    // Simulate mouse move right
    act(() => {
      // @ts-ignore - we know this exists
      mouseMoveHandler({
        clientX: 200,
        clientY: 100,
      } as MouseEvent);
    });
    
    // Width should increase, height should stay the same
    expect(result.current.size.width).toBe(200);
    expect(result.current.size.height).toBe(100);
    
    // Reset for next test
    document.addEventListener = vi.fn();
    
    // Start a new hook for testing the bottom direction
    const { result: result2 } = renderHook(() => useResizable({ width: 100, height: 100 }));
    
    // Set ref.current
    Object.defineProperty(result2.current.ref, 'current', {
      value: mockElement,
      writable: true
    });
    
    // Test bottom direction
    act(() => {
      const mockEvent = {
        clientX: 100,
        clientY: 100,
        preventDefault: vi.fn(),
        nativeEvent: {} as MouseEvent,
      };
      
      result2.current.handleResizeStart(mockEvent as any, 'bottom');
    });
    
    // Capture the mousemove handler for bottom direction
    addEventListenerCalls = (document.addEventListener as any).mock.calls;
    for (const call of addEventListenerCalls) {
      if (call[0] === 'mousemove') {
        mouseMoveHandler = call[1];
        break;
      }
    }
    
    // Simulate mouse move down
    act(() => {
      // @ts-ignore - we know this exists
      mouseMoveHandler({
        clientX: 100,
        clientY: 200,
      } as MouseEvent);
    });
    
    // Width should stay the same, height should increase
    expect(result2.current.size.width).toBe(100);
    expect(result2.current.size.height).toBe(200);
  });

  it('calls onResizeEnd callback when resizing stops', () => {
    // Create a mock function for onResizeEnd
    const onResizeEnd = vi.fn();
    
    // We'll need to create a custom implementation of the hook
    // to ensure the size updates and can be passed to onResizeEnd
    const { result } = renderHook(() => {
      const resizable = useResizable(
        { width: 100, height: 100 },
        { onResizeEnd }
      );
      
      return {
        ...resizable,
        // Override the handleResizeStart to make testing easier
        customHandleResizeStart: (direction: 'corner' | 'right' | 'bottom') => {
          // Start resizing
          resizable.handleResizeStart({
            clientX: 100,
            clientY: 100,
            preventDefault: vi.fn(),
            nativeEvent: {} as MouseEvent,
          } as any, direction);
        }
      };
    });
    
    // Set ref.current
    Object.defineProperty(result.current.ref, 'current', {
      value: mockElement,
      writable: true
    });
    
    // Start resizing
    act(() => {
      result.current.customHandleResizeStart('corner');
    });
    
    // Check that we are actually resizing
    expect(result.current.isResizing).toBe(true);
    
    // Capture event handlers
    let mouseMoveHandler: (e: MouseEvent) => void;
    let mouseUpHandler: (e: MouseEvent) => void;
    
    const addEventListenerCalls = (document.addEventListener as any).mock.calls;
    for (const call of addEventListenerCalls) {
      if (call[0] === 'mousemove') {
        mouseMoveHandler = call[1];
      }
      if (call[0] === 'mouseup') {
        mouseUpHandler = call[1];
      }
    }
    
    // First simulate a mouse move to change the size
    act(() => {
      // @ts-ignore - we know this exists
      mouseMoveHandler({
        clientX: 200,
        clientY: 200,
      } as MouseEvent);
    });
    
    // Then simulate a mouse up to end resizing
    act(() => {
      // @ts-ignore - we know this exists
      mouseUpHandler();
    });
    
    // The callback should have been called with the new size
    expect(onResizeEnd).toHaveBeenCalled();
    
    // Check the first argument of the first call
    const callArgs = onResizeEnd.mock.calls[0][0];
    expect(callArgs).toHaveProperty('width');
    expect(callArgs).toHaveProperty('height');
  });

  it('stops resizing on mouse up', () => {
    const { result } = renderHook(() => useResizable({ width: 100, height: 100 }));
    
    // Set ref.current
    Object.defineProperty(result.current.ref, 'current', {
      value: mockElement,
      writable: true
    });
    
    // Start resizing
    act(() => {
      const mockEvent = {
        clientX: 100,
        clientY: 100,
        preventDefault: vi.fn(),
        nativeEvent: {} as MouseEvent,
      };
      
      result.current.handleResizeStart(mockEvent as any, 'corner');
    });
    
    // Capture the mouseup handler
    let mouseUpHandler: () => void;
    
    const addEventListenerCalls = (document.addEventListener as any).mock.calls;
    for (const call of addEventListenerCalls) {
      if (call[0] === 'mouseup') {
        mouseUpHandler = call[1];
        break;
      }
    }
    
    // Simulate mouse up
    act(() => {
      // @ts-ignore - we know this exists
      mouseUpHandler();
    });
    
    // Should no longer be resizing
    expect(result.current.isResizing).toBe(false);
  });
}); 