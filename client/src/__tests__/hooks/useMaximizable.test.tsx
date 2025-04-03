import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMaximizable } from '../../hooks/useMaximizable';

describe('useMaximizable hook', () => {
  // Original implementation
  const originalGetItem = window.localStorage.getItem;
  const originalSetItem = window.localStorage.setItem;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock localStorage methods
    window.localStorage.getItem = vi.fn();
    window.localStorage.setItem = vi.fn();
  });
  
  afterEach(() => {
    // Restore original methods
    window.localStorage.getItem = originalGetItem;
    window.localStorage.setItem = originalSetItem;
  });
  
  it('initializes with isMaximized=false by default', () => {
    const { result } = renderHook(() => useMaximizable());
    
    expect(result.current.isMaximized).toBe(false);
  });
  
  it('toggles the maximized state', () => {
    const mockRef = { current: document.createElement('div') };
    const { result } = renderHook(() => useMaximizable());
    
    // Initially not maximized
    expect(result.current.isMaximized).toBe(false);
    
    // Toggle to maximized
    act(() => {
      result.current.toggleMaximize(mockRef as React.RefObject<HTMLElement>);
    });
    
    expect(result.current.isMaximized).toBe(true);
    
    // Toggle back to not maximized
    act(() => {
      result.current.toggleMaximize(mockRef as React.RefObject<HTMLElement>);
    });
    
    expect(result.current.isMaximized).toBe(false);
  });
  
  it('calls onMaximize callback when maximized state changes', () => {
    const onMaximizeMock = vi.fn();
    const mockRef = { current: document.createElement('div') };
    
    const { result } = renderHook(() => useMaximizable({
      onMaximize: onMaximizeMock
    }));
    
    act(() => {
      result.current.toggleMaximize(mockRef as React.RefObject<HTMLElement>);
    });
    
    expect(onMaximizeMock).toHaveBeenCalledWith(true);
    
    act(() => {
      result.current.toggleMaximize(mockRef as React.RefObject<HTMLElement>);
    });
    
    expect(onMaximizeMock).toHaveBeenCalledWith(false);
  });
  
  it('loads initial state from localStorage when stateKey is provided', () => {
    // Set up mock return value
    const getItemMock = window.localStorage.getItem as jest.Mock;
    getItemMock.mockReturnValue('true');
    
    const { result } = renderHook(() => useMaximizable({
      stateKey: 'test-maximized-state'
    }));
    
    expect(window.localStorage.getItem).toHaveBeenCalledWith('test-maximized-state');
    expect(result.current.isMaximized).toBe(true);
  });
  
  it('saves state to localStorage when stateKey is provided', () => {
    const mockRef = { current: document.createElement('div') };
    
    const { result } = renderHook(() => useMaximizable({
      stateKey: 'test-maximized-state'
    }));
    
    // Initial render should trigger a localStorage.setItem call with the default state
    expect(window.localStorage.setItem).toHaveBeenCalledWith('test-maximized-state', 'false');
    
    // Clear mock to check for new calls
    const setItemMock = window.localStorage.setItem as jest.Mock;
    setItemMock.mockClear();
    
    act(() => {
      result.current.toggleMaximize(mockRef as React.RefObject<HTMLElement>);
    });
    
    expect(window.localStorage.setItem).toHaveBeenCalledWith('test-maximized-state', 'true');
    
    // Clear mock again
    setItemMock.mockClear();
    
    act(() => {
      result.current.toggleMaximize(mockRef as React.RefObject<HTMLElement>);
    });
    
    expect(window.localStorage.setItem).toHaveBeenCalledWith('test-maximized-state', 'false');
  });
}); 