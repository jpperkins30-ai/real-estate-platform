import React, { useEffect, useRef } from 'react';
// Import types only, we'll use dynamic component creation
import type { DraggableCore, DraggableData, DraggableEvent } from 'react-draggable';
import type { ResizeCallbackData } from 'react-resizable';
import { PanelState, PanelAction } from '../../../types/layout.types';
import './AdvancedLayout.css';

// We'll dynamically import the actual components
let Draggable: any;
let Resizable: any;

// Dynamically load the components
if (typeof window !== 'undefined') {
  import('react-draggable').then(module => {
    Draggable = module.default;
  });
  import('react-resizable').then(module => {
    Resizable = module.Resizable;
  });
}

interface AdvancedLayoutProps {
  panelStates: PanelState[];
  maximizedPanelId: string | null;
  handlePanelAction: (action: PanelAction) => void;
  renderPanel: (panelId: string, isMaximized: boolean) => React.ReactNode;
  className?: string;
}

/**
 * Advanced layout component for draggable, resizable panels
 */
export const AdvancedLayout: React.FC<AdvancedLayoutProps> = ({
  panelStates,
  maximizedPanelId,
  handlePanelAction,
  renderPanel,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const visiblePanels = panelStates.filter(panel => panel.isVisible !== false);

  // Update z-index when panels are clicked
  const handlePanelClick = (panelId: string) => {
    const highestZIndex = Math.max(
      ...panelStates.map(p => p.position.zIndex || 0),
      0
    );
    
    handlePanelAction({
      type: 'move',
      panelId,
      payload: {
        zIndex: highestZIndex + 1,
      },
    });
  };

  // Handle panel dragging
  const handleDrag = (panelId: string, e: DraggableEvent, data: DraggableData) => {
    handlePanelAction({
      type: 'move',
      panelId,
      payload: {
        x: data.x,
        y: data.y,
      },
    });
  };

  // Handle panel resizing
  const handleResize = (
    panelId: string,
    e: React.SyntheticEvent,
    data: ResizeCallbackData
  ) => {
    const { size } = data;
    handlePanelAction({
      type: 'resize',
      panelId,
      payload: {
        width: size.width,
        height: size.height,
      },
    });
  };

  // Ensure panels stay within container boundaries
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    
    panelStates.forEach(panel => {
      const { id, position } = panel;
      let needsUpdate = false;
      const newPosition = { ...position };
      
      // Check if panel is outside container boundaries
      if (position.x < 0) {
        newPosition.x = 0;
        needsUpdate = true;
      }
      
      if (position.y < 0) {
        newPosition.y = 0;
        needsUpdate = true;
      }
      
      if (position.x + position.width > containerRect.width) {
        newPosition.x = Math.max(0, containerRect.width - position.width);
        needsUpdate = true;
      }
      
      if (position.y + position.height > containerRect.height) {
        newPosition.y = Math.max(0, containerRect.height - position.height);
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        handlePanelAction({
          type: 'move',
          panelId: id,
          payload: newPosition,
        });
      }
    });
  }, [panelStates, handlePanelAction]);

  // Render function for a panel
  const renderPanelElement = (panel: PanelState) => {
    const { id, title, position, isClosable, isMaximizable, isResizable, isDraggable } = panel;
    const isMaximized = maximizedPanelId === id;
    
    // If any panel is maximized, only show that panel
    if (maximizedPanelId !== null && maximizedPanelId !== id) {
      return null;
    }
    
    let panelElement = (
      <div
        key={id}
        className={`advanced-panel ${isMaximized ? 'maximized' : ''}`}
        style={{
          position: 'absolute',
          left: isMaximized ? 0 : position.x,
          top: isMaximized ? 0 : position.y,
          width: isMaximized ? '100%' : position.width,
          height: isMaximized ? '100%' : position.height,
          zIndex: position.zIndex || 1,
        }}
        onClick={() => handlePanelClick(id)}
        data-testid={`panel-${id}`}
      >
        <div className="panel-header">
          <div className="panel-title">{title}</div>
          <div className="panel-controls">
            {isMaximizable && (
              <button
                className="panel-control maximize-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePanelAction({
                    type: isMaximized ? 'restore' : 'maximize',
                    panelId: id,
                  });
                }}
                aria-label={isMaximized ? 'Restore panel' : 'Maximize panel'}
                title={isMaximized ? 'Restore' : 'Maximize'}
                data-testid={`${id}-${isMaximized ? 'restore' : 'maximize'}-button`}
              >
                {isMaximized ? '□' : '▢'}
              </button>
            )}
            
            {isClosable && (
              <button
                className="panel-control close-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePanelAction({
                    type: 'close',
                    panelId: id,
                  });
                }}
                aria-label="Close panel"
                title="Close"
                data-testid={`${id}-close-button`}
              >
                ×
              </button>
            )}
          </div>
        </div>
        
        <div className="panel-content">
          {renderPanel(id, isMaximized)}
        </div>
      </div>
    );
    
    // If maximized or not draggable/resizable, return the panel as is
    if (isMaximized || (!isDraggable && !isResizable)) {
      return panelElement;
    }
    
    // Create a wrapped panel element with the necessary functionality
    let wrappedElement = panelElement;
    
    // Wrap with draggable functionality if needed
    if (isDraggable && Draggable) {
      const DraggableComponent = Draggable;
      wrappedElement = (
        <DraggableComponent
          key={`draggable-${id}`}
          handle=".panel-header"
          defaultPosition={{ x: position.x, y: position.y }}
          position={{ x: position.x, y: position.y }}
          grid={[5, 5]}
          scale={1}
          onDrag={(e: DraggableEvent, data: DraggableData) => handleDrag(id, e, data)}
          bounds="parent"
        >
          {wrappedElement}
        </DraggableComponent>
      );
    }
    
    // Wrap with resizable functionality if needed
    if (isResizable && Resizable) {
      const ResizableComponent = Resizable;
      
      // Define min/max dimensions
      const minConstraints: [number, number] = [
        panel.minWidth || 200,
        panel.minHeight || 150,
      ];
      
      const maxConstraints: [number, number] = [
        panel.maxWidth || 2000,
        panel.maxHeight || 2000,
      ];
      
      return (
        <ResizableComponent
          key={`resizable-${id}`}
          width={position.width}
          height={position.height}
          onResize={(e: React.SyntheticEvent, data: ResizeCallbackData) => handleResize(id, e, data)}
          minConstraints={minConstraints}
          maxConstraints={maxConstraints}
          resizeHandles={['se']}
        >
          {wrappedElement}
        </ResizableComponent>
      );
    }
    
    return wrappedElement;
  };

  // Render layout
  return (
    <div 
      ref={containerRef}
      className={`advanced-layout ${className}`}
      data-testid="advanced-layout"
    >
      {visiblePanels.map(renderPanelElement)}
    </div>
  );
};
