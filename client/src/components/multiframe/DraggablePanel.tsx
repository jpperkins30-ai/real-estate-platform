import React, { useState, useEffect } from 'react';
import { PanelHeader } from './PanelHeader';
import './DraggablePanel.css';

export interface DraggablePanelProps {
  id: string;
  title: string;
  contentType: string;
  children: React.ReactNode;
  className?: string;
  initialState?: {
    position?: { x: number, y: number };
    size?: { width: number, height: number };
    isMaximized?: boolean;
  };
  onStateChange?: (state: any) => void;
  onAction?: (action: { type: string, panelId?: string, payload?: any }) => void;
  onResize?: (dimensions: { width: number, height: number }) => void;
  draggable?: boolean;
  resizable?: boolean;
  maximizable?: boolean;
  closable?: boolean;
}

export const DraggablePanel: React.FC<DraggablePanelProps> = ({
  id,
  title,
  contentType,
  children,
  className = '',
  initialState = {},
  onStateChange,
  onAction,
  onResize,
  draggable = true,
  resizable = true,
  maximizable = true,
  closable = true
}) => {
  const [position, setPosition] = useState(initialState.position || { x: 0, y: 0 });
  const [size, setSize] = useState(initialState.size || { width: 300, height: 200 });
  const [isMaximized, setIsMaximized] = useState(initialState.isMaximized || false);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(`panel-${id}-state`);
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        setPosition(state.position || position);
        setSize(state.size || size);
        setIsMaximized(state.isMaximized || isMaximized);
        
        if (onStateChange) {
          onStateChange(state);
        }
      } catch (error) {
        console.error('Error parsing saved panel state:', error);
      }
    }
    
    // Save initial state
    saveState();
  }, [id]);
  
  const saveState = () => {
    const state = { position, size, isMaximized };
    localStorage.setItem(`panel-${id}-state`, JSON.stringify(state));
    
    if (onStateChange) {
      onStateChange(state);
    }
  };
  
  const handleAction = (action: { type: string, panelId: string }) => {
    if (onAction) {
      onAction({
        ...action,
        panelId: id
      });
    }
    
    if (action.type === 'maximize') {
      setIsMaximized(!isMaximized);
      localStorage.setItem(`panel-${id}-maximized`, JSON.stringify(!isMaximized));
      saveState();
    }
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!draggable || isMaximized) return;
    
    if (onAction) {
      onAction({
        type: 'drag',
        panelId: id,
        payload: {
          clientX: e.clientX,
          clientY: e.clientY
        }
      });
    }
  };
  
  const panelStyle = {
    transform: `translate(${position.x}px, ${position.y}px)`,
    width: size.width,
    height: size.height
  };
  
  return (
    <div 
      className={`draggable-panel ${className} ${isMaximized ? 'maximized' : ''}`}
      style={panelStyle}
      data-testid={`draggable-panel-${id}`}
    >
      <div 
        className="drag-handle" 
        onMouseDown={handleMouseDown}
        data-testid="drag-handle"
      >
        <PanelHeader
          title={title}
          isMaximized={isMaximized}
          onAction={handleAction}
          draggable={draggable}
          showMaximizeButton={maximizable}
          showCloseButton={closable}
        />
      </div>
      
      <div className="panel-content">
        {children}
      </div>
      
      {resizable && !isMaximized && (
        <div 
          className="resize-handle resize-handle-se"
          data-testid="resize-handle-se"
        />
      )}
    </div>
  );
}; 