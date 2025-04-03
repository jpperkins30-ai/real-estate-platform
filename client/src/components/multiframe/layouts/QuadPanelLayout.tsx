import React from 'react';
import { PanelConfig, PanelContentType } from '../../../types/layout.types';
import { PanelContainer } from '../PanelContainer';
import './QuadPanelLayout.css';

interface QuadPanelLayoutProps {
  panels: PanelConfig[];
  onPanelStateChange?: (panelId: string, newState: any) => void;
  onPanelAction?: (panelId: string, action: any) => void;
}

export const QuadPanelLayout: React.FC<QuadPanelLayoutProps> = ({ 
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
  
  const bottomLeftPanel = panels.find(p => 
    p.position && p.position.row === 1 && p.position.col === 0
  ) || panels[2];
  
  const bottomRightPanel = panels.find(p => 
    p.position && p.position.row === 1 && p.position.col === 1
  ) || panels[3];
  
  if (!topLeftPanel || !topRightPanel || !bottomLeftPanel || !bottomRightPanel) {
    return <div className="empty-layout" data-testid="empty-quad-layout">Insufficient panels configured</div>;
  }
  
  return (
    <div className="quad-panel-layout" data-testid="quad-layout">
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
          id={bottomLeftPanel.id}
          title={bottomLeftPanel.title}
          contentType={bottomLeftPanel.contentType as PanelContentType}
          initialState={bottomLeftPanel.initialState}
          className="bottom-left-panel panel-container"
          onStateChange={newState => onPanelStateChange?.(bottomLeftPanel.id, newState)}
          onAction={action => onPanelAction?.(bottomLeftPanel.id, action)}
        />
        <PanelContainer
          id={bottomRightPanel.id}
          title={bottomRightPanel.title}
          contentType={bottomRightPanel.contentType as PanelContentType}
          initialState={bottomRightPanel.initialState}
          className="bottom-right-panel panel-container"
          onStateChange={newState => onPanelStateChange?.(bottomRightPanel.id, newState)}
          onAction={action => onPanelAction?.(bottomRightPanel.id, action)}
        />
      </div>
    </div>
  );
}; 