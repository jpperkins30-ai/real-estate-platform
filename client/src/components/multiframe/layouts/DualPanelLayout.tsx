import React from 'react';
import { PanelConfig, PanelContentType } from '../../../types/layout.types';
import { PanelContainer } from '../PanelContainer';
import './DualPanelLayout.css';

interface DualPanelLayoutProps {
  panels: PanelConfig[];
  onPanelStateChange?: (panelId: string, newState: any) => void;
  onPanelAction?: (panelId: string, action: any) => void;
}

export const DualPanelLayout: React.FC<DualPanelLayoutProps> = ({ 
  panels,
  onPanelStateChange,
  onPanelAction
}) => {
  // Ensure we have exactly two panels
  const leftPanel = panels.find(p => 
    p.position && p.position.row === 0 && p.position.col === 0
  ) || panels[0];
  
  const rightPanel = panels.find(p => 
    p.position && p.position.row === 0 && p.position.col === 1
  ) || panels[1];
  
  if (!leftPanel || !rightPanel) {
    return <div className="empty-layout" data-testid="empty-dual-layout">Insufficient panels configured</div>;
  }
  
  return (
    <div className="dual-panel-layout" data-testid="dual-layout">
      <PanelContainer
        id={leftPanel.id}
        title={leftPanel.title}
        contentType={leftPanel.contentType as PanelContentType}
        initialState={leftPanel.initialState}
        className="left-panel panel-container"
        onStateChange={newState => onPanelStateChange?.(leftPanel.id, newState)}
        onAction={action => onPanelAction?.(leftPanel.id, action)}
      />
      <PanelContainer
        id={rightPanel.id}
        title={rightPanel.title}
        contentType={rightPanel.contentType as PanelContentType}
        initialState={rightPanel.initialState}
        className="right-panel panel-container"
        onStateChange={newState => onPanelStateChange?.(rightPanel.id, newState)}
        onAction={action => onPanelAction?.(rightPanel.id, action)}
      />
    </div>
  );
}; 