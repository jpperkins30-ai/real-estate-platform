import React from 'react';
import { PanelContainer } from '../PanelContainer';
import { PanelConfig, StandardPanelConfig } from '../../../types/layout.types';
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
    'position' in p && p.position && 'row' in p.position && p.position.row === 0 && p.position.col === 0
  ) || panels[0];
  
  const rightPanel = panels.find(p => 
    'position' in p && p.position && 'row' in p.position && p.position.row === 0 && p.position.col === 1
  ) || panels[1];
  
  if (!leftPanel || !rightPanel) {
    return <div className="empty-layout" data-testid="empty-dual-layout">Insufficient panels configured</div>;
  }
  
  return (
    <div className="dual-panel-layout" data-testid="dual-layout">
      <div className="left-panel">
        <PanelContainer
          id={leftPanel.id}
          title={leftPanel.title}
          contentType={leftPanel.contentType}
          initialState={leftPanel.state}
          className="panel-container"
          maximizable={'maximizable' in leftPanel ? leftPanel.maximizable : true}
          closable={'closable' in leftPanel ? leftPanel.closable : false}
          onStateChange={newState => onPanelStateChange?.(leftPanel.id, newState)}
          onAction={action => onPanelAction?.(leftPanel.id, action)}
        />
      </div>
      <div className="right-panel">
        <PanelContainer
          id={rightPanel.id}
          title={rightPanel.title}
          contentType={rightPanel.contentType}
          initialState={rightPanel.state}
          className="panel-container"
          maximizable={'maximizable' in rightPanel ? rightPanel.maximizable : true}
          closable={'closable' in rightPanel ? rightPanel.closable : false}
          onStateChange={newState => onPanelStateChange?.(rightPanel.id, newState)}
          onAction={action => onPanelAction?.(rightPanel.id, action)}
        />
      </div>
    </div>
  );
}; 