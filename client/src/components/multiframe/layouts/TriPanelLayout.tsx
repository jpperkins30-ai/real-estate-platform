import React from 'react';
import { PanelConfig, PanelContentType } from '../../../types/layout.types';
import { PanelContainer } from '../PanelContainer';
import './TriPanelLayout.css';

interface TriPanelLayoutProps {
  panels: PanelConfig[];
  onPanelStateChange?: (panelId: string, newState: any) => void;
  onPanelAction?: (panelId: string, action: any) => void;
}

export const TriPanelLayout: React.FC<TriPanelLayoutProps> = ({ 
  panels,
  onPanelStateChange,
  onPanelAction
}) => {
  // Get panels based on position
  const topLeftPanel = panels.find(p => 
    p.position && p.position.row === 0 && p.position.col === 0
  ) || panels[0];
  
  const topRightPanel = panels.find(p => 
    p.position && p.position.row === 0 && p.position.col === 1
  ) || panels[1];
  
  const bottomPanel = panels.find(p => 
    p.position && p.position.row === 1
  ) || panels[2];
  
  if (!topLeftPanel || !topRightPanel || !bottomPanel) {
    return <div className="empty-layout" data-testid="empty-tri-layout">Insufficient panels configured</div>;
  }
  
  return (
    <div className="tri-panel-layout" data-testid="tri-layout">
      <div className="top-row">
        <PanelContainer
          id={topLeftPanel.id}
          title={topLeftPanel.title}
          contentType={topLeftPanel.contentType as PanelContentType}
          initialState={topLeftPanel.initialState}
          className="top-left-panel panel-container"
          onStateChange={newState => onPanelStateChange?.(topLeftPanel.id, newState)}
          onAction={action => onPanelAction?.(topLeftPanel.id, action)}
        />
        <PanelContainer
          id={topRightPanel.id}
          title={topRightPanel.title}
          contentType={topRightPanel.contentType as PanelContentType}
          initialState={topRightPanel.initialState}
          className="top-right-panel panel-container"
          onStateChange={newState => onPanelStateChange?.(topRightPanel.id, newState)}
          onAction={action => onPanelAction?.(topRightPanel.id, action)}
        />
      </div>
      <div className="bottom-row">
        <PanelContainer
          id={bottomPanel.id}
          title={bottomPanel.title}
          contentType={bottomPanel.contentType as PanelContentType}
          initialState={bottomPanel.initialState}
          className="bottom-panel panel-container"
          onStateChange={newState => onPanelStateChange?.(bottomPanel.id, newState)}
          onAction={action => onPanelAction?.(bottomPanel.id, action)}
        />
      </div>
    </div>
  );
}; 