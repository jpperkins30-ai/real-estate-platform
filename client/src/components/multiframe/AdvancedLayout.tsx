import React, { useState, useCallback, useMemo } from 'react';
import { DraggablePanel } from './DraggablePanel';
import { getPanelComponent } from './PanelRegistry';
import { PanelConfig } from '../../types/layout.types';
import './AdvancedLayout.css';

interface AdvancedLayoutProps {
  panels: PanelConfig[];
  onPanelAction?: (panelId: string, action: { type: string; payload?: any }) => void;
  onPanelStateChange?: (panelId: string, state: any) => void;
  className?: string;
}

/**
 * Advanced layout component that supports draggable, resizable, and maximizable panels
 */
export const AdvancedLayout: React.FC<AdvancedLayoutProps> = ({
  panels,
  onPanelAction,
  onPanelStateChange,
  className = '',
}) => {
  const [activePanels, setActivePanels] = useState<PanelConfig[]>(panels);
  const [maximizedPanelId, setMaximizedPanelId] = useState<string | null>(null);
  
  // Handle panel actions
  const handlePanelAction = useCallback((panelId: string, action: { type: string; payload?: any }) => {
    if (action.type === 'close') {
      setActivePanels(prev => prev.filter(p => p.id !== panelId));
    } else if (action.type === 'maximize') {
      setMaximizedPanelId(panelId);
    } else if (action.type === 'restore') {
      setMaximizedPanelId(null);
    }
    
    if (onPanelAction) {
      onPanelAction(panelId, action);
    }
  }, [onPanelAction]);
  
  // Handle panel state changes
  const handlePanelStateChange = useCallback((panelId: string, state: any) => {
    if (onPanelStateChange) {
      onPanelStateChange(panelId, state);
    }
  }, [onPanelStateChange]);
  
  // Render each panel with the proper component
  const renderPanels = useMemo(() => {
    return activePanels.map(panel => {
      const PanelContent = getPanelComponent(panel.contentType);
      
      // Skip if component not found
      if (!PanelContent) {
        console.warn(`No component registered for panel type: ${panel.contentType}`);
        return null;
      }
      
      // Determine default position based on order in array
      const index = activePanels.indexOf(panel);
      const defaultPosition = {
        x: (index % 2) * 420,
        y: Math.floor(index / 2) * 320,
      };
      
      // Only allow one maximized panel at a time
      const isMaximized = maximizedPanelId === panel.id;
      const canDrag = maximizedPanelId === null || isMaximized;
      
      return (
        <DraggablePanel
          key={panel.id}
          id={panel.id}
          title={panel.title}
          contentType={panel.contentType}
          initialState={panel.initialState || {}}
          defaultPosition={defaultPosition}
          draggable={canDrag}
          resizable={canDrag}
          maximizable={true}
          onAction={(action) => handlePanelAction(panel.id, action)}
          onStateChange={(state) => handlePanelStateChange(panel.id, state)}
          className={isMaximized ? 'panel-maximized' : ''}
        >
          <PanelContent />
        </DraggablePanel>
      );
    }).filter(Boolean);
  }, [activePanels, maximizedPanelId, handlePanelAction, handlePanelStateChange]);
  
  // Apply a class based on whether a panel is maximized
  const layoutClass = `advanced-layout ${maximizedPanelId ? 'has-maximized-panel' : ''} ${className}`;
  
  return (
    <div className={layoutClass} data-testid="advanced-layout">
      {renderPanels}
    </div>
  );
}; 