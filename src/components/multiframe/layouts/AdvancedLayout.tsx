import React, { useState, useCallback } from 'react';
import { PanelContainer } from '../PanelContainer';
import { AdvancedPanelConfig, AdvancedPanelPosition } from '../../../types/layout.types';
import './AdvancedLayout.css';

interface AdvancedLayoutProps {
  panels: AdvancedPanelConfig[];
  onPanelPositionChange?: (panelId: string, newPosition: AdvancedPanelPosition) => void;
  onPanelStateChange?: (panelId: string, newState: any) => void;
  onPanelClose?: (panelId: string) => void;
  onPanelAdd?: (newPanel: AdvancedPanelConfig) => void;
}

export const AdvancedLayout: React.FC<AdvancedLayoutProps> = ({
  panels,
  onPanelPositionChange,
  onPanelStateChange,
  onPanelClose,
  onPanelAdd
}) => {
  // State for dragging
  const [draggingPanel, setDraggingPanel] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Handle panel drag start
  const handleDragStart = useCallback((panelId: string, clientX: number, clientY: number) => {
    setDraggingPanel(panelId);
    
    // Find panel element to calculate drag offset
    const panelElement = document.querySelector(`[data-panel-id="${panelId}"]`);
    if (panelElement) {
      const rect = panelElement.getBoundingClientRect();
      setDragOffset({
        x: clientX - rect.left,
        y: clientY - rect.top
      });
    }
  }, []);
  
  // Handle panel drag
  const handleDrag = useCallback((clientX: number, clientY: number) => {
    if (!draggingPanel || !onPanelPositionChange) return;
    
    const panel = panels.find(p => p.id === draggingPanel);
    if (!panel) return;
    
    // Get container dimensions for percentage calculation
    const container = document.querySelector('.advanced-layout');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    
    // Calculate new position in percentages
    const newX = Math.max(0, Math.min(100, ((clientX - dragOffset.x - containerRect.left) / containerRect.width) * 100));
    const newY = Math.max(0, Math.min(100, ((clientY - dragOffset.y - containerRect.top) / containerRect.height) * 100));
    
    // Update panel position
    onPanelPositionChange(draggingPanel, {
      ...panel.position,
      x: newX,
      y: newY
    });
  }, [draggingPanel, dragOffset, panels, onPanelPositionChange]);
  
  // Handle panel drag end
  const handleDragEnd = useCallback(() => {
    setDraggingPanel(null);
  }, []);
  
  // Handle panel resize (simplified without the react-resizable dependency)
  const handleResize = useCallback((panelId: string, deltaWidth: number, deltaHeight: number) => {
    if (!onPanelPositionChange) return;
    
    const panel = panels.find(p => p.id === panelId);
    if (!panel) return;
    
    // Get container dimensions for percentage calculation
    const container = document.querySelector('.advanced-layout');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    
    // Calculate new size in percentages
    const deltaWidthPercent = (deltaWidth / containerRect.width) * 100;
    const deltaHeightPercent = (deltaHeight / containerRect.height) * 100;
    
    const newWidth = Math.max(10, Math.min(100, panel.position.width + deltaWidthPercent));
    const newHeight = Math.max(10, Math.min(100, panel.position.height + deltaHeightPercent));
    
    // Update panel position with new size
    onPanelPositionChange(panelId, {
      ...panel.position,
      width: newWidth,
      height: newHeight
    });
  }, [panels, onPanelPositionChange]);
  
  // Handle panel close
  const handlePanelClose = useCallback((panelId: string) => {
    if (onPanelClose) {
      onPanelClose(panelId);
    }
  }, [onPanelClose]);
  
  // Handle panel action
  const handlePanelAction = useCallback((panelId: string, action: any) => {
    if (action.type === 'close') {
      handlePanelClose(panelId);
    }
  }, [handlePanelClose]);
  
  return (
    <div 
      className="advanced-layout" 
      data-testid="advanced-layout"
      onMouseMove={e => draggingPanel && handleDrag(e.clientX, e.clientY)}
      onMouseUp={() => draggingPanel && handleDragEnd()}
      onMouseLeave={() => draggingPanel && handleDragEnd()}
    >
      {panels.map(panel => (
        <div 
          key={panel.id}
          className="advanced-panel-wrapper"
          style={{
            position: 'absolute',
            left: `${panel.position.x}%`,
            top: `${panel.position.y}%`,
            width: `${panel.position.width}%`,
            height: `${panel.position.height}%`,
            zIndex: draggingPanel === panel.id ? 10 : 1
          }}
        >
          <div 
            className="panel-drag-handle"
            onMouseDown={e => handleDragStart(panel.id, e.clientX, e.clientY)}
          ></div>
          <div className="panel-resize-handle" data-testid={`resize-handle-${panel.id}`}></div>
          <PanelContainer
            id={panel.id}
            title={panel.title}
            contentType={panel.contentType}
            initialState={panel.state}
            className="advanced-panel"
            maximizable={panel.maximizable}
            closable={panel.closable}
            onStateChange={newState => onPanelStateChange?.(panel.id, newState)}
            onAction={action => handlePanelAction(panel.id, action)}
          />
        </div>
      ))}
      
      {/* Optional: Add panel button */}
      {onPanelAdd && (
        <button 
          className="add-panel-button" 
          onClick={() => {
            if (onPanelAdd) {
              const newPanelId = `panel-${Date.now()}`;
              onPanelAdd({
                id: newPanelId,
                contentType: 'map',
                title: 'New Panel',
                position: { x: 10, y: 10, width: 30, height: 30 },
                maximizable: true,
                closable: true
              });
            }
          }}
          data-testid="add-panel-button"
        >
          Add Panel
        </button>
      )}
    </div>
  );
}; 