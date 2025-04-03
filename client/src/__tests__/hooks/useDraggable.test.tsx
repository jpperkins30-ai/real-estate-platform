import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDraggable } from '../../hooks/useDraggable';

// Define types for event handlers
type MouseMoveHandler = (event: { clientX: number; clientY: number }) => void;
type MouseUpHandler = () => void;

describe('useDraggable hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Create mocks for document methods
  const originalAddEventListener = document.addEventListener;
  const originalRemoveEventListener = document.removeEventListener;

  beforeEach(() => {
    // Reset mocks before each test
    document.addEventListener = vi.fn();
    document.removeEventListener = vi.fn();
  });

  afterEach(() => {
    // Restore original document methods
    document.addEventListener = originalAddEventListener;
    document.removeEventListener = originalRemoveEventListener;
  });

  it('initializes with the provided position', () => {
    const initialPosition = { x: 100, y: 200 };
    const { result } = renderHook(() => useDraggable(initialPosition));
    
    expect(result.current.position).toEqual(initialPosition);
    expect(result.current.isDragging).toBe(false);
  });
  
  it('changes isDragging state on mouse down event', () => {
    const { result } = renderHook(() => useDraggable());
    
    // Create mock element
    const mockElement = {
      getBoundingClientRect: () => ({
        left: 0,
        top: 0,
        width: 100,
        height: 100,
      }),
    };
    
    // Set ref value by using Object.defineProperty to bypass readonly
    Object.defineProperty(result.current.ref, 'current', {
      value: mockElement,
      writable: true
    });
    
    // Simulate mousedown
    act(() => {
      const mockEvent = {
        clientX: 50,
        clientY: 50,
        preventDefault: vi.fn(),
        target: { closest: () => true },
      };
      
      result.current.onMouseDown(mockEvent as any);
    });
    
    expect(result.current.isDragging).toBe(true);
  });
  
  it('updates position during drag', () => {
    const { result } = renderHook(() => useDraggable({ x: 0, y: 0 }));
    
    // Create mock element with parent
    const mockElement = {
      getBoundingClientRect: () => ({
        left: 0,
        top: 0, 
        width: 100,
        height: 100
      }),
      parentElement: {
        getBoundingClientRect: () => ({
          left: 0,
          top: 0,
          width: 500,
          height: 500
        })
      }
    };
    
    // Set ref
    Object.defineProperty(result.current.ref, 'current', {
      value: mockElement,
      writable: true
    });
    
    // Start dragging
    act(() => {
      const mockEvent = {
        clientX: 50,
        clientY: 50,
        preventDefault: vi.fn(),
        target: { closest: () => true }
      };
      
      result.current.onMouseDown(mockEvent as any);
    });
    
    // Capture mousemove event handler
    let mouseMoveHandler: MouseMoveHandler | undefined;
    expect(document.addEventListener).toHaveBeenCalled();
    
    const addEventListener = document.addEventListener as jest.Mock;
    for (const call of addEventListener.mock.calls) {
      if (call[0] === 'mousemove') {
        mouseMoveHandler = call[1] as MouseMoveHandler;
        break;
      }
    }
    
    // Trigger mousemove event
    act(() => {
      if (mouseMoveHandler) {
        mouseMoveHandler({
          clientX: 150,
          clientY: 150
        });
      }
    });
    
    // Check position was updated
    expect(result.current.position.x).toBeGreaterThan(0);
    expect(result.current.position.y).toBeGreaterThan(0);
  });
  
  it('stops dragging on mouse up', () => {
    const { result } = renderHook(() => useDraggable());
    
    // Mock element
    const mockElement = {
      getBoundingClientRect: () => ({
        left: 0,
        top: 0,
        width: 100,
        height: 100,
      }),
    };
    
    // Set ref value using Object.defineProperty
    Object.defineProperty(result.current.ref, 'current', {
      value: mockElement,
      writable: true
    });
    
    // Start dragging
    act(() => {
      const mockEvent = {
        clientX: 50,
        clientY: 50,
        preventDefault: vi.fn(),
        target: { closest: () => true },
      };
      
      result.current.onMouseDown(mockEvent as any);
    });
    
    // Verify isDragging is true
    expect(result.current.isDragging).toBe(true);
    
    // Manually call the mouseup handler that would be registered
    // First, capture the mouseup handler
    let mouseUpHandler: MouseUpHandler | undefined;
    act(() => {
      // Find the mouseup handler
      const calls = (document.addEventListener as any).mock.calls;
      for (const call of calls) {
        if (call[0] === 'mouseup') {
          mouseUpHandler = call[1] as MouseUpHandler;
          break;
        }
      }
      
      // Call the handler
      if (mouseUpHandler) {
        mouseUpHandler();
      }
    });
    
    // Verify isDragging is now false
    expect(result.current.isDragging).toBe(false);
  });
  
  it('respects drag handle selector', () => {
    const { result } = renderHook(() => 
      useDraggable({ x: 0, y: 0 }, { dragHandleSelector: '.drag-handle' })
    );
    
    // Mock with handle selector that passes
    const handleElement = {
      closest: (selector: string) => selector === '.drag-handle'
    };
    
    // Mock element
    const mockElement = {
      getBoundingClientRect: () => ({
        left: 0,
        top: 0,
        width: 100,
        height: 100,
      }),
    };
    
    // Set ref value using Object.defineProperty
    Object.defineProperty(result.current.ref, 'current', {
      value: mockElement,
      writable: true
    });
    
    // Simulate mousedown with element that passes closest check
    act(() => {
      const mockEvent = {
        clientX: 50,
        clientY: 50,
        preventDefault: vi.fn(),
        target: handleElement,
      };
      
      result.current.onMouseDown(mockEvent as any);
    });
    
    // Should start dragging
    expect(result.current.isDragging).toBe(true);
    
    // Reset dragging state manually for testing
    act(() => {
      // Since we can't directly modify the state, trigger the mouseup handler
      const calls = (document.addEventListener as any).mock.calls;
      for (const call of calls) {
        if (call[0] === 'mouseup') {
          const mouseUpHandler = call[1] as MouseUpHandler;
          mouseUpHandler();
          break;
        }
      }
    });
    
    // Mock with handle selector that fails
    const nonHandleElement = {
      closest: (selector: string) => false
    };
    
    // Simulate mousedown with element that fails closest check
    act(() => {
      const mockEvent = {
        clientX: 50,
        clientY: 50,
        preventDefault: vi.fn(),
        target: nonHandleElement,
      };
      
      result.current.onMouseDown(mockEvent as any);
    });
    
    // Should not start dragging
    expect(result.current.isDragging).toBe(false);
  });
  
  it('calls onDragEnd callback when dragging stops', () => {
    const onDragEnd = vi.fn();
    const { result } = renderHook(() => useDraggable({ x: 0, y: 0 }, { onDragEnd }));
    
    // Create mock element
    const mockElement = {
      getBoundingClientRect: () => ({
        left: 0,
        top: 0,
        width: 100,
        height: 100
      }),
      parentElement: {
        getBoundingClientRect: () => ({
          left: 0,
          top: 0,
          width: 500,
          height: 500
        })
      }
    };
    
    // Set ref
    Object.defineProperty(result.current.ref, 'current', {
      value: mockElement,
      writable: true
    });
    
    // Start dragging
    act(() => {
      const mockEvent = {
        clientX: 50,
        clientY: 50,
        preventDefault: vi.fn(),
        target: { closest: () => true }
      };
      
      result.current.onMouseDown(mockEvent as any);
    });
    
    // Capture mouseup event handler
    let mouseUpHandler: MouseUpHandler | undefined;
    expect(document.addEventListener).toHaveBeenCalled();
    
    const addEventListener = document.addEventListener as jest.Mock;
    for (const call of addEventListener.mock.calls) {
      if (call[0] === 'mouseup') {
        mouseUpHandler = call[1] as MouseUpHandler;
        break;
      }
    }
    
    // Trigger mouseup event
    act(() => {
      if (mouseUpHandler) {
        mouseUpHandler();
      }
    });
    
    // Check callback was called
    expect(onDragEnd).toHaveBeenCalled();
  });
}); 