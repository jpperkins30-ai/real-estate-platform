import React, { useRef, useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import { useDraggable } from '../../hooks/useDraggable';
import { useResizable } from '../../hooks/useResizable';
import { useMaximizable } from '../../hooks/useMaximizable';
import './DraggablePanel.css';

interface DraggablePanelProps {
  id: string;
  title: string;
  contentType: string;
  initialState?: Record<string, any>;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: number; height: number };
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  draggable?: boolean;
  resizable?: boolean;
  maximizable?: boolean;
  onStateChange?: (state: Record<string, any>) => void;
  onAction?: (action: { type: string; payload?: any }) => void;
  className?: string;
  children: React.ReactNode;
}

/**
 * Enhanced panel component with dragging, resizing, and maximizing capabilities
 */
export const DraggablePanel: React.FC<DraggablePanelProps> = ({
  id,
  title,
  contentType,
  initialState = {},
  defaultPosition = { x: 0, y: 0 },
  defaultSize = { width: 400, height: 300 },
  minWidth = 200,
  minHeight = 150,
  maxWidth = 1200,
  maxHeight = 800,
  draggable = true,
  resizable = true,
  maximizable = true,
  onStateChange,
  onAction,
  className = '',
  children
}) => {
  const [state, setState] = useState(initialState);
  const panelRef = useRef<HTMLDivElement>(null);
  const stateKey = `panel-${id}-state`;
  
  // Initialize panel state from localStorage
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(stateKey);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        setState(parsedState);
        
        // Call onStateChange to notify parent component about the restored state
        if (onStateChange) {
          onStateChange(parsedState);
        }
      }
    } catch (error) {
      console.error(`Error loading state for panel ${id}:`, error);
    }
  }, [id, stateKey, onStateChange]);
  
  // Save state changes to localStorage
  useEffect(() => {
    if (Object.keys(state).length > 0) {
      try {
        localStorage.setItem(stateKey, JSON.stringify(state));
        if (onStateChange) {
          onStateChange(state);
        }
      } catch (error) {
        console.error(`Error saving state for panel ${id}:`, error);
      }
    }
  }, [state, id, stateKey, onStateChange]);
  
  // Integration with the draggable hook
  const { position, isDragging, ref: dragRef, onMouseDown } = useDraggable(defaultPosition, {
    enabled: draggable,
    dragHandleSelector: '.panel-header',
    onDragEnd: (newPosition) => {
      setState(prev => ({ ...prev, position: newPosition }));
    }
  });
  
  // Integration with the resizable hook
  const { size, isResizing, handleResizeStart } = useResizable(defaultSize, {
    enabled: resizable,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    onResizeEnd: (newSize) => {
      setState(prev => ({ ...prev, size: newSize }));
    }
  });
  
  // Integration with the maximizable hook
  const { isMaximized, toggleMaximize } = useMaximizable({
    stateKey: `panel-${id}-maximized`,
    onMaximize: (maximized) => {
      if (onAction) {
        onAction({ 
          type: maximized ? 'maximize' : 'restore',
          payload: { id, maximized }
        });
      }
    }
  });
  
  // Handle panel actions
  const handleAction = (actionType: string) => {
    if (actionType === 'maximize') {
      toggleMaximize(panelRef);
    }
    
    if (onAction) {
      onAction({ type: actionType });
    }
  };
  
  // Panel classes based on state
  const panelClasses = [
    'draggable-panel',
    isDragging ? 'dragging' : '',
    isResizing ? 'resizing' : '',
    isMaximized ? 'maximized' : '',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div
      ref={panelRef}
      className={panelClasses}
      style={{
        width: isMaximized ? '100%' : size.width,
        height: isMaximized ? '100%' : size.height,
        transform: isMaximized ? 'none' : `translate(${position.x}px, ${position.y}px)`
      }}
      data-panel-id={id}
      data-testid={`panel-${id}`}
    >
      <div className="panel-header" onMouseDown={draggable ? onMouseDown : undefined}>
        <h3 className="panel-title">{title}</h3>
        <div className="panel-actions">
          {maximizable && (
            <button
              className={`panel-action maximize-action ${isMaximized ? 'active' : ''}`}
              onClick={() => handleAction('maximize')}
              aria-label={isMaximized ? 'Restore' : 'Maximize'}
            >
              <span className={isMaximized ? 'restore-icon' : 'maximize-icon'}></span>
            </button>
          )}
          <button
            className="panel-action close-action"
            onClick={() => handleAction('close')}
            aria-label="Close"
          >
            <span className="close-icon"></span>
          </button>
        </div>
      </div>
      
      <div className="panel-content">
        {children}
      </div>
      
      {resizable && !isMaximized && (
        <>
          <div
            className="resize-handle resize-handle-e"
            onMouseDown={(e) => handleResizeStart(e, 'right')}
          />
          <div
            className="resize-handle resize-handle-s"
            onMouseDown={(e) => handleResizeStart(e, 'bottom')}
          />
          <div
            className="resize-handle resize-handle-se"
            onMouseDown={(e) => handleResizeStart(e, 'corner')}
          >
            <div className="resize-handle-icon"></div>
          </div>
        </>
      )}
    </div>
  );
}; 