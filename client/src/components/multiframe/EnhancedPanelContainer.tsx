import React, { useCallback, useEffect } from 'react';
import { PanelHeader } from './PanelHeader';
import { useDraggable } from '../../hooks/useDraggable';
import { useResizable } from '../../hooks/useResizable';
import { usePanelSync } from '../../hooks/usePanelSync';
import { usePanelState } from '../../hooks/usePanelState';
import { useLayoutContext } from '../../hooks/useLayoutContext';
import { getPanelContent } from '../../services/panelContentRegistry';
import { PanelContentType, StandardPanelConfig } from '../../types/layout.types';
import './EnhancedPanelContainer.css';

// Define types for panel events
interface PanelEvent {
  type: string;
  payload: any;
  source: string;
}

interface EnhancedPanelContainerProps {
  id: string;
  title: string;
  contentType: PanelContentType;
  initialState?: Record<string, any>;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  draggable?: boolean;
  resizable?: boolean;
  maximizable?: boolean;
  showControls?: boolean;
  closable?: boolean;
  onStateChange?: (state: Record<string, any>) => void;
  onPositionChange?: (position: { row: number; col: number }) => void;
  onSizeChange?: (size: { width: number; height: number }) => void;
  onClose?: () => void;
  customControls?: React.ReactNode;
  className?: string;
}

export function EnhancedPanelContainer({
  id,
  title,
  contentType,
  initialState = {},
  initialPosition = { x: 0, y: 0 },
  initialSize = { width: 100, height: 100 },
  position,
  size,
  draggable = false,
  resizable = false,
  maximizable = true,
  showControls = true,
  closable = false,
  onStateChange,
  onPositionChange,
  onSizeChange,
  onClose,
  customControls,
  className = ''
}: EnhancedPanelContainerProps) {
  // References
  const panelRef = React.useRef<HTMLDivElement>(null);
  
  // Use panel state hook
  const {
    state: panelState,
    updateState,
    updatePosition,
    updateSize,
    toggleMaximized
  } = usePanelState({
    panelId: id,
    initialState: {
      ...initialState,
      position: initialPosition,
      size: initialSize,
      isMaximized: false
    },
    onStateChange
  });
  
  const isMaximized = Boolean(panelState.isMaximized);
  
  // Hooks
  const { broadcast, subscribe } = usePanelSync();
  const { registerPanel, unregisterPanel, updatePanelConfig } = useLayoutContext();
  
  // Use the custom hooks for dragging and resizing with state from usePanelState
  const { isDragging, position: dragPosition, ref: draggableRef, onMouseDown } = useDraggable(
    panelState.position || initialPosition,
    { 
      enabled: draggable && !isMaximized,
      dragHandleSelector: '.panel-header',
      onDragEnd: (pos) => {
        updatePosition(pos);
        if (onPositionChange) {
          const gridPosition = calculateGridPosition(pos);
          onPositionChange(gridPosition);
        }
      }
    }
  );
  
  const { isResizing, size: resizeSize, ref: resizableRef, handleResizeStart } = useResizable(
    panelState.size || initialSize,
    {
      enabled: resizable && !isMaximized,
      minWidth: 100,
      minHeight: 100,
      onResizeEnd: (newSize) => {
        updateSize(newSize);
        if (onSizeChange) {
          onSizeChange(newSize);
        }
      }
    }
  );
  
  // Calculate grid position from pixel position
  const calculateGridPosition = (pixelPosition: { x: number; y: number }) => {
    // Implementation for grid calculation
    const row = Math.floor((pixelPosition.y / window.innerHeight) * 12);
    const col = Math.floor((pixelPosition.x / window.innerWidth) * 12);
    return { row, col };
  };
  
  // Register panel with layout context on mount
  useEffect(() => {
    const config: StandardPanelConfig = {
      id,
      title,
      contentType,
      visible: true,
      closable,
      maximizable,
      state: panelState
    };
    
    registerPanel(id, config);
    
    return () => {
      unregisterPanel(id);
    };
  }, [id, contentType, title, registerPanel, unregisterPanel, panelState, closable, maximizable]);
  
  // Subscribe to events from other panels
  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (event.source !== id) {
        // Process events and update state accordingly
        if (event.type === 'select' || event.type === 'filter') {
          updateState(event.payload);
        }
      }
    });
    
    return unsubscribe;
  }, [id, subscribe, updateState]);
  
  // Handle panel actions
  const handlePanelAction = useCallback((action: { type: string, payload?: any }) => {
    switch (action.type) {
      case 'maximize':
        toggleMaximized();
        break;
      case 'close':
        if (onClose) onClose();
        break;
      case 'refresh':
        console.log(`Refreshing panel ${id}`);
        break;
      case 'export':
        console.log(`Exporting panel ${id}`);
        break;
      default:
        if (['select', 'filter', 'highlight'].includes(action.type)) {
          broadcast(action.type, action.payload, id);
        }
    }
  }, [id, broadcast, toggleMaximized, onClose]);
  
  // Get panel content component
  const PanelContent = getPanelContent(contentType);
  
  // Set refs using callbacks rather than direct assignment
  const setRefs = useCallback((el: HTMLDivElement | null) => {
    if (panelRef && typeof panelRef === 'object') {
      // @ts-ignore - Need to ignore to avoid read-only errors
      panelRef.current = el;
    }
    
    if (draggable && draggableRef && typeof draggableRef === 'object') {
      // @ts-ignore - Need to ignore to avoid read-only errors
      draggableRef.current = el;
    }
    
    if (resizable && resizableRef && typeof resizableRef === 'object') {
      // @ts-ignore - Need to ignore to avoid read-only errors
      resizableRef.current = el;
    }
  }, [draggable, resizable, draggableRef, resizableRef]);
  
  // Class names based on state
  const containerClassNames = [
    'enhanced-panel-container',
    isDragging ? 'dragging' : '',
    isResizing ? 'resizing' : '',
    isMaximized ? 'maximized' : '',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div 
      ref={setRefs}
      className={containerClassNames} 
      style={{
        transform: draggable && !isMaximized ? `translate(${dragPosition.x}px, ${dragPosition.y}px)` : undefined,
        width: resizable && !isMaximized ? `${resizeSize.width}px` : undefined,
        height: resizable && !isMaximized ? `${resizeSize.height}px` : undefined
      }}
      onMouseDown={draggable ? onMouseDown : undefined}
      data-panel-id={id}
    >
      <PanelHeader 
        title={title}
        draggable={draggable}
        isMaximized={isMaximized}
        onAction={handlePanelAction}
        showMaximizeButton={maximizable}
        showCloseButton={closable}
        showControls={showControls}
        customControls={customControls}
      />
      
      <div className="panel-content">
        {PanelContent ? (
          <PanelContent
            panelId={id}
            initialState={panelState}
            onStateChange={updateState}
            onAction={handlePanelAction}
          />
        ) : (
          <div className="no-content">
            No content available for type: {contentType}
          </div>
        )}
      </div>
      
      {/* Resize handles */}
      {resizable && !isMaximized && (
        <>
          <div 
            className="resize-handle resize-right"
            onMouseDown={(e) => handleResizeStart(e, 'right')}
          />
          <div 
            className="resize-handle resize-bottom"
            onMouseDown={(e) => handleResizeStart(e, 'bottom')}
          />
          <div 
            className="resize-handle resize-corner"
            onMouseDown={(e) => handleResizeStart(e, 'corner')}
          />
        </>
      )}
    </div>
  );
} 