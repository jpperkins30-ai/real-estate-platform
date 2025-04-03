import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usePanelState } from '../../hooks/usePanelState';

describe('usePanelState hook', () => {
  // Mock localStorage
  const originalGetItem = window.localStorage.getItem;
  const originalSetItem = window.localStorage.setItem;
  const originalRemoveItem = window.localStorage.removeItem;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock localStorage methods
    window.localStorage.getItem = vi.fn();
    window.localStorage.setItem = vi.fn();
    window.localStorage.removeItem = vi.fn();
  });
  
  afterEach(() => {
    // Restore original methods
    window.localStorage.getItem = originalGetItem;
    window.localStorage.setItem = originalSetItem;
    window.localStorage.removeItem = originalRemoveItem;
  });
  
  it('initializes with default state', () => {
    const { result } = renderHook(() => usePanelState({ panelId: 'test-panel' }));
    
    expect(result.current.state).toEqual({});
  });
  
  it('initializes with provided initial state', () => {
    const initialState = { 
      position: { x: 10, y: 20 },
      size: { width: 300, height: 200 }
    };
    
    const { result } = renderHook(() => usePanelState({ 
      panelId: 'test-panel',
      initialState 
    }));
    
    expect(result.current.state).toEqual(initialState);
  });
  
  it('loads state from localStorage if available', () => {
    const savedState = { 
      position: { x: 50, y: 60 },
      size: { width: 400, height: 300 }
    };
    
    // Set up mock return value
    (window.localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(savedState));
    
    const { result } = renderHook(() => usePanelState({ 
      panelId: 'test-panel'
    }));
    
    expect(window.localStorage.getItem).toHaveBeenCalledWith('panel-test-panel-state');
    expect(result.current.state).toEqual(savedState);
  });
  
  it('merges localStorage state with initial state', () => {
    const initialState = { 
      position: { x: 10, y: 20 },
      size: { width: 300, height: 200 },
      customProp: 'initial value'
    };
    
    const savedState = { 
      position: { x: 50, y: 60 },
      customProp2: 'saved value'
    };
    
    // Set up mock return value
    (window.localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(savedState));
    
    const { result } = renderHook(() => usePanelState({ 
      panelId: 'test-panel',
      initialState
    }));
    
    // Should merge saved state with initial state
    expect(result.current.state).toEqual({
      position: { x: 50, y: 60 }, // From saved state
      size: { width: 300, height: 200 }, // From initial state
      customProp: 'initial value', // From initial state
      customProp2: 'saved value' // From saved state
    });
  });
  
  it('updates position correctly', () => {
    const { result } = renderHook(() => usePanelState({ 
      panelId: 'test-panel'
    }));
    
    act(() => {
      result.current.updatePosition({ x: 100, y: 150 });
    });
    
    expect(result.current.state.position).toEqual({ x: 100, y: 150 });
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      'panel-test-panel-state',
      expect.any(String)
    );
  });
  
  it('updates size correctly', () => {
    const { result } = renderHook(() => usePanelState({ 
      panelId: 'test-panel'
    }));
    
    act(() => {
      result.current.updateSize({ width: 500, height: 400 });
    });
    
    expect(result.current.state.size).toEqual({ width: 500, height: 400 });
  });
  
  it('toggles maximized state correctly', () => {
    const { result } = renderHook(() => usePanelState({ 
      panelId: 'test-panel'
    }));
    
    // Initially not maximized
    expect(result.current.state.isMaximized).toBeFalsy();
    
    act(() => {
      result.current.toggleMaximized();
    });
    
    expect(result.current.state.isMaximized).toBe(true);
    
    act(() => {
      result.current.toggleMaximized();
    });
    
    expect(result.current.state.isMaximized).toBe(false);
  });
  
  it('updates arbitrary properties', () => {
    const { result } = renderHook(() => usePanelState({ 
      panelId: 'test-panel'
    }));
    
    act(() => {
      result.current.updateProperty('customProp', 'test value');
    });
    
    expect(result.current.state.customProp).toBe('test value');
  });
  
  it('updates multiple properties at once', () => {
    const { result } = renderHook(() => usePanelState({ 
      panelId: 'test-panel'
    }));
    
    act(() => {
      result.current.updateState({
        position: { x: 200, y: 300 },
        size: { width: 600, height: 450 },
        customProp: 'bulk update'
      });
    });
    
    expect(result.current.state).toEqual({
      position: { x: 200, y: 300 },
      size: { width: 600, height: 450 },
      customProp: 'bulk update'
    });
  });
  
  it('resets state to initial values', () => {
    const initialState = { customProp: 'initial value' };
    
    const { result } = renderHook(() => usePanelState({ 
      panelId: 'test-panel',
      initialState
    }));
    
    // Update some state
    act(() => {
      result.current.updateState({
        position: { x: 200, y: 300 },
        customProp: 'modified value'
      });
    });
    
    // Verify state was updated
    expect(result.current.state.customProp).toBe('modified value');
    
    // Reset state
    act(() => {
      result.current.resetState();
    });
    
    // Verify state was reset to initial values
    expect(result.current.state).toEqual(initialState);
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('panel-test-panel-state');
  });
  
  it('calls onStateChange when state changes', () => {
    const onStateChangeMock = vi.fn();
    
    const { result } = renderHook(() => usePanelState({ 
      panelId: 'test-panel',
      onStateChange: onStateChangeMock
    }));
    
    act(() => {
      result.current.updatePosition({ x: 100, y: 150 });
    });
    
    expect(onStateChangeMock).toHaveBeenCalledWith({
      position: { x: 100, y: 150 }
    });
  });
  
  it('does not persist state when persistState is false', () => {
    const { result } = renderHook(() => usePanelState({ 
      panelId: 'test-panel',
      persistState: false
    }));
    
    act(() => {
      result.current.updatePosition({ x: 100, y: 150 });
    });
    
    expect(window.localStorage.setItem).not.toHaveBeenCalled();
  });
}); 