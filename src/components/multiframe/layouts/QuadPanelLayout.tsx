import React from 'react';
import { PanelContainer } from '../PanelContainer';
import { PanelConfig, StandardPanelConfig } from '../../../types/layout.types';
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
    'position' in p && p.position && 'row' in p.position && 
    p.position.row === 0 && p.position.col === 0
  ) || panels[0];
  
  const topRightPanel = panels.find(p => 
    'position' in p && p.position && 'row' in p.position && 
    p.position.row === 0 && p.position.col === 1
  ) || panels[1];
  
  const bottomLeftPanel = panels.find(p => 
    'position' in p && p.position && 'row' in p.position && 
    p.position.row === 1 && p.position.col === 0
  ) || panels[2];
  
  const bottomRightPanel = panels.find(p => 
    'position' in p && p.position && 'row' in p.position && 
    p.position.row === 1 && p.position.col === 1
  ) || panels[3];
  
  if (!topLeftPanel || !topRightPanel || !bottomLeftPanel || !bottomRightPanel) {
    return <div className="empty-layout" data-testid="empty-quad-layout">Insufficient panels configured</div>;
  }
  
  return (
    <div className="quad-panel-layout" data-testid="quad-layout">
      <div className="top-row">
        <div className="top-left-panel">
          <PanelContainer
            id={topLeftPanel.id}
            title={topLeftPanel.title}
            contentType={topLeftPanel.contentType}
            initialState={topLeftPanel.state}
            className="panel-container"
            maximizable={'maximizable' in topLeftPanel ? topLeftPanel.maximizable : true}
            closable={'closable' in topLeftPanel ? topLeftPanel.closable : false}
            onStateChange={newState => onPanelStateChange?.(topLeftPanel.id, newState)}
            onAction={action => onPanelAction?.(topLeftPanel.id, action)}
          />
        </div>
        <div className="top-right-panel">
          <PanelContainer
            id={topRightPanel.id}
            title={topRightPanel.title}
            contentType={topRightPanel.contentType}
            initialState={topRightPanel.state}
            className="panel-container"
            maximizable={'maximizable' in topRightPanel ? topRightPanel.maximizable : true}
            closable={'closable' in topRightPanel ? topRightPanel.closable : false}
            onStateChange={newState => onPanelStateChange?.(topRightPanel.id, newState)}
            onAction={action => onPanelAction?.(topRightPanel.id, action)}
          />
        </div>
      </div>
      <div className="bottom-row">
        <div className="bottom-left-panel">
          <PanelContainer
            id={bottomLeftPanel.id}
            title={bottomLeftPanel.title}
            contentType={bottomLeftPanel.contentType}
            initialState={bottomLeftPanel.state}
            className="panel-container"
            maximizable={'maximizable' in bottomLeftPanel ? bottomLeftPanel.maximizable : true}
            closable={'closable' in bottomLeftPanel ? bottomLeftPanel.closable : false}
            onStateChange={newState => onPanelStateChange?.(bottomLeftPanel.id, newState)}
            onAction={action => onPanelAction?.(bottomLeftPanel.id, action)}
          />
        </div>
        <div className="bottom-right-panel">
          <PanelContainer
            id={bottomRightPanel.id}
            title={bottomRightPanel.title}
            contentType={bottomRightPanel.contentType}
            initialState={bottomRightPanel.state}
            className="panel-container"
            maximizable={'maximizable' in bottomRightPanel ? bottomRightPanel.maximizable : true}
            closable={'closable' in bottomRightPanel ? bottomRightPanel.closable : false}
            onStateChange={newState => onPanelStateChange?.(bottomRightPanel.id, newState)}
            onAction={action => onPanelAction?.(bottomRightPanel.id, action)}
          />
        </div>
      </div>
    </div>
  );
}; 