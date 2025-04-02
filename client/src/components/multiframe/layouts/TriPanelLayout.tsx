import React from 'react';
import { PanelContainer } from '../PanelContainer';
import { PanelConfig, StandardPanelConfig } from '../../../types/layout.types';
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
    'position' in p && p.position && 'row' in p.position && p.position.row === 0 && p.position.col === 0
  ) || panels[0];
  
  const topRightPanel = panels.find(p => 
    'position' in p && p.position && 'row' in p.position && p.position.row === 0 && p.position.col === 1
  ) || panels[1];
  
  const bottomPanel = panels.find(p => 
    'position' in p && p.position && 'row' in p.position && p.position.row === 1
  ) || panels[2];
  
  if (!topLeftPanel || !topRightPanel || !bottomPanel) {
    return <div className="empty-layout" data-testid="empty-tri-layout">Insufficient panels configured</div>;
  }
  
  return (
    <div className="tri-panel-layout" data-testid="tri-layout">
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
        <PanelContainer
          id={bottomPanel.id}
          title={bottomPanel.title}
          contentType={bottomPanel.contentType}
          initialState={bottomPanel.state}
          className="panel-container"
          maximizable={'maximizable' in bottomPanel ? bottomPanel.maximizable : true}
          closable={'closable' in bottomPanel ? bottomPanel.closable : false}
          onStateChange={newState => onPanelStateChange?.(bottomPanel.id, newState)}
          onAction={action => onPanelAction?.(bottomPanel.id, action)}
        />
      </div>
    </div>
  );
}; 