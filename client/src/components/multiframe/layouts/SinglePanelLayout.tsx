import React from 'react';
import { PanelConfig } from '../../../types/layout.types';
import { PanelContainer } from '../PanelContainer';
import './SinglePanelLayout.css';

interface SinglePanelLayoutProps {
  panels: PanelConfig[];
  onPanelStateChange?: (panelId: string, newState: any) => void;
  onPanelAction?: (panelId: string, action: any) => void;
}

export const SinglePanelLayout: React.FC<SinglePanelLayoutProps> = ({ 
  panels,
  onPanelStateChange,
  onPanelAction
}) => {
  // For single panel layout, we only use the first panel
  const panel = panels[0];
  
  if (!panel) {
    return <div className="empty-layout" data-testid="empty-single-layout">No panel configured</div>;
  }
  
  return (
    <div className="single-panel-layout" data-testid="single-layout">
      <PanelContainer
        id={panel.id}
        title={panel.title}
        contentType={panel.contentType}
        initialState={panel.initialState}
        className="full-size-panel"
        onStateChange={newState => onPanelStateChange?.(panel.id, newState)}
        onAction={action => onPanelAction?.(panel.id, action)}
      />
    </div>
  );
}; 