// Test Case 401: Verify AdvancedLayout renders panels with correct positions
// Test Case TC401: Verify AdvancedLayout renders panels with correct positions
// Test Case TC401: Verify AdvancedLayout renders panels with correct positions
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAdvancedLayout } from "../hooks/useAdvancedLayout";
import { PanelConfig } from '../../types/layout.types';

describe('useAdvancedLayout hook', () => {
  // Mock localStorage
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Clear localStorage and mock methods
    localStorage.clear = vi.fn();
    localStorage.getItem = vi.fn().mockReturnValue(null);
    localStorage.setItem = vi.fn();
  });

  const initialPanels: PanelConfig[] = [
    {
      id: 'panel1',
      title: 'Panel 1',
      type: 'testType',
      position: { x: 0, y: 0, width: 300, height: 200 },
      isClosable: true,
      isMaximizable: true,
      isResizable: true,
      isDraggable: true,
    },
    {
      id: 'panel2',
      title: 'Panel 2',
      type: 'testType',
      position: { x: 350, y: 0, width: 300, height: 200 },
    }
  ];
  
  it('initializes with the provided panels', () => {
    const { result } = renderHook(() => useAdvancedLayout({ 
      initialPanels, 
      shouldPersist: false // Disable persistence to avoid localStorage
    }));
    
    expect(result.current.panelStates).toHaveLength(2);
    expect(result.current.panelStates[0].id).toBe('panel1');
    expect(result.current.panelStates[1].id).toBe('panel2');
    expect(result.current.isAnyPanelMaximized).toBe(false);
    expect(result.current.maximizedPanelId).toBe(null);
  });

  it('handles maximize action correctly', () => {
    const { result } = renderHook(() => useAdvancedLayout({ 
      initialPanels, 
      shouldPersist: false
    }));
    
    act(() => {
      result.current.handlePanelAction({
        type: 'maximize',
        panelId: 'panel1'
      });
    });
    
    expect(result.current.isAnyPanelMaximized).toBe(true);
    expect(result.current.maximizedPanelId).toBe('panel1');
    expect(result.current.panelStates[0].isMaximized).toBe(true);
  });

  it('handles restore action correctly', () => {
    const { result } = renderHook(() => useAdvancedLayout({ 
      initialPanels, 
      shouldPersist: false
    }));
    
    // First maximize
    act(() => {
      result.current.handlePanelAction({
        type: 'maximize',
        panelId: 'panel1'
      });
    });
    
    // Then restore
    act(() => {
      result.current.handlePanelAction({
        type: 'restore',
        panelId: 'panel1'
      });
    });
    
    expect(result.current.isAnyPanelMaximized).toBe(false);
    expect(result.current.maximizedPanelId).toBe(null);
    expect(result.current.panelStates[0].isMaximized).toBe(false);
  });

  it('handles close action correctly', () => {
    const { result } = renderHook(() => useAdvancedLayout({ 
      initialPanels, 
      shouldPersist: false
    }));
    
    act(() => {
      result.current.handlePanelAction({
        type: 'close',
        panelId: 'panel1'
      });
    });
    
    expect(result.current.panelStates[0].isVisible).toBe(false);
  });

  it('handles move action correctly', () => {
    const { result } = renderHook(() => useAdvancedLayout({ 
      initialPanels, 
      shouldPersist: false
    }));
    
    act(() => {
      result.current.handlePanelAction({
        type: 'move',
        panelId: 'panel1',
        payload: { x: 150, y: 150 }
      });
    });
    
    expect(result.current.panelStates[0].position.x).toBe(150);
    expect(result.current.panelStates[0].position.y).toBe(150);
  });

  it('handles resize action correctly', () => {
    const { result } = renderHook(() => useAdvancedLayout({ 
      initialPanels, 
      shouldPersist: false
    }));
    
    act(() => {
      result.current.handlePanelAction({
        type: 'resize',
        panelId: 'panel1',
        payload: { width: 400, height: 300 }
      });
    });
    
    expect(result.current.panelStates[0].position.width).toBe(400);
    expect(result.current.panelStates[0].position.height).toBe(300);
  });

  it('adds a new panel correctly', () => {
    const { result } = renderHook(() => useAdvancedLayout({ 
      initialPanels, 
      shouldPersist: false
    }));
    
    const newPanel: PanelConfig = {
      id: 'panel3',
      title: 'Panel 3',
      type: 'testType',
      position: { x: 700, y: 0, width: 300, height: 200 }
    };
    
    act(() => {
      result.current.addPanel(newPanel);
    });
    
    expect(result.current.panelStates).toHaveLength(3);
    expect(result.current.panelStates[2].id).toBe('panel3');
  });

  it('resets layout to initial state', () => {
    const { result } = renderHook(() => useAdvancedLayout({ 
      initialPanels, 
      shouldPersist: false
    }));
    
    // Modify the layout
    act(() => {
      result.current.handlePanelAction({
        type: 'maximize',
        panelId: 'panel1'
      });
    });
    
    expect(result.current.isAnyPanelMaximized).toBe(true);
    
    // Reset layout
    act(() => {
      result.current.resetLayout();
    });
    
    expect(result.current.isAnyPanelMaximized).toBe(false);
    expect(result.current.maximizedPanelId).toBe(null);
    expect(result.current.panelStates[0].isMaximized).toBe(false);
  });

  it('gets panel state by ID correctly', () => {
    const { result } = renderHook(() => useAdvancedLayout({ 
      initialPanels, 
      shouldPersist: false
    }));
    
    const panelState = result.current.getPanelState('panel1');
    
    expect(panelState).toBeDefined();
    expect(panelState?.id).toBe('panel1');
  });

  it('attempts to save to localStorage when shouldPersist is true', () => {
    const { result } = renderHook(() => useAdvancedLayout({ 
      initialPanels, 
      storageKey: 'test-storage-key',
      shouldPersist: true 
    }));
    
    // Trigger panel action that changes state
    act(() => {
      result.current.handlePanelAction({
        type: 'maximize',
        panelId: 'panel1'
      });
    });
    
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'test-storage-key',
      expect.any(String)
    );
  });
  
  it('does not save to localStorage when shouldPersist is false', () => {
    const { result } = renderHook(() => useAdvancedLayout({ 
      initialPanels, 
      shouldPersist: false 
    }));
    
    act(() => {
      result.current.handlePanelAction({
        type: 'maximize',
        panelId: 'panel1'
      });
    });
    
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
}); 




