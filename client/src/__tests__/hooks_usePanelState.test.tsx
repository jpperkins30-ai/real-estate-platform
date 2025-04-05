import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usePanelState } from 'src/hooks/usePanelState';
import * as panelStateService from 'src/services/panelStateService';
import { PanelContentType } from '../../types/layout.types';

// Mock the panel state service
vi.mock('../../services/panelStateService', () => ({
  loadPanelState: vi.fn(),
  savePanelState: vi.fn(),
  deletePanelState: vi.fn()
}));

describe('usePanelState hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset panel state service mocks
    vi.mocked(panelStateService.loadPanelState).mockReset();
    vi.mocked(panelStateService.savePanelState).mockReset();
    vi.mocked(panelStateService.deletePanelState).mockReset();
  });
  
  it('initializes with default state', () => {
    const { result } = renderHook(() => usePanelState({ 
      panelId: 'test-panel',
      initialState: {} 
    }));
    
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
    
    // Set up mock return value with the proper panel state structure
    vi.mocked(panelStateService.loadPanelState).mockReturnValue({
      id: 'test-panel',
      contentType: 'map' as PanelContentType,
      state: savedState,
      lastUpdated: new Date().toISOString(),
      version: 1
    });
    
    const { result } = renderHook(() => usePanelState({ 
      panelId: 'test-panel',
      initialState: {}
    }));
    
    expect(panelStateService.loadPanelState).toHaveBeenCalledWith('test-panel', false);
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
    
    // Set up mock return value with the proper panel state structure
    vi.mocked(panelStateService.loadPanelState).mockReturnValue({
      id: 'test-panel',
      contentType: 'map' as PanelContentType,
      state: savedState,
      lastUpdated: new Date().toISOString(),
      version: 1
    });
    
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
      panelId: 'test-panel',
      initialState: {}
    }));
    
    act(() => {
      result.current.updatePosition({ x: 100, y: 150 });
    });
    
    expect(result.current.state.position).toEqual({ x: 100, y: 150 });
    expect(panelStateService.savePanelState).toHaveBeenCalled();
  });
  
  it('updates size correctly', () => {
    const { result } = renderHook(() => usePanelState({ 
      panelId: 'test-panel',
      initialState: {}
    }));
    
    act(() => {
      result.current.updateSize({ width: 500, height: 400 });
    });
    
    expect(result.current.state.size).toEqual({ width: 500, height: 400 });
  });
  
  it('toggles maximized state correctly', () => {
    const { result } = renderHook(() => usePanelState({ 
      panelId: 'test-panel',
      initialState: {}
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
  
  it('updates custom properties', () => {
    const { result } = renderHook(() => usePanelState({ 
      panelId: 'test-panel',
      initialState: {}
    }));
    
    act(() => {
      result.current.updateState({
        customProp: 'test value'
      });
    });
    
    expect(result.current.state.customProp).toBe('test value');
  });
  
  it('updates multiple properties at once', () => {
    const { result } = renderHook(() => usePanelState({ 
      panelId: 'test-panel',
      initialState: {}
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
    expect(panelStateService.deletePanelState).toHaveBeenCalledWith('test-panel', false);
  });
  
  it('calls onStateChange when state changes', () => {
    const onStateChangeMock = vi.fn();
    
    const { result } = renderHook(() => usePanelState({ 
      panelId: 'test-panel',
      initialState: {},
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
      initialState: {},
      persistState: false
    }));
    
    act(() => {
      result.current.updatePosition({ x: 100, y: 150 });
    });
    
    expect(panelStateService.savePanelState).not.toHaveBeenCalled();
  });
}); 


