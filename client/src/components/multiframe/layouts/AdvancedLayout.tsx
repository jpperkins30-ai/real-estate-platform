import React from 'react';
import { AdvancedPanelConfig, PanelContentType } from '../../../types/layout.types';
import { PanelContainer } from '../PanelContainer';
import './AdvancedLayout.css';

interface AdvancedLayoutProps {
  panels: AdvancedPanelConfig[];
  onPanelStateChange?: (panelId: string, newState: any) => void;
  onPanelAction?: (panelId: string, action: any) => void;
  onPanelClose?: (panelId: string) => void;
  onPanelAdd?: (panelConfig: Partial<AdvancedPanelConfig>) => void;
}

export const AdvancedLayout: React.FC<AdvancedLayoutProps> = ({
  panels,
  onPanelStateChange,
  onPanelAction,
  onPanelClose,
  onPanelAdd
}) => {
  const handlePanelAction = (panelId: string, action: any) => {
    if (action.type === 'close' && onPanelClose) {
      onPanelClose(panelId);
      return;
    }
    
    if (onPanelAction) {
      onPanelAction(panelId, action);
    }
  };
  
  const handleAddPanel = () => {
    if (onPanelAdd) {
      // Generate a default new panel config
      const newPanel: Partial<AdvancedPanelConfig> = {
        contentType: 'map',
        title: 'New Panel',
        maximizable: true,
        closable: true
      };
      
      onPanelAdd(newPanel);
    }
  };
  
  return (
    <div className="advanced-layout" data-testid="advanced-layout">
      {panels.map(panel => (
        <div 
          key={panel.id}
          className="advanced-panel-wrapper"
          style={{
            position: 'absolute',
            left: `${panel.position.x}%`,
            top: `${panel.position.y}%`,
            width: `${panel.position.width}%`,
            height: `${panel.position.height}%`
          }}
        >
          <PanelContainer
            id={panel.id}
            title={panel.title}
            contentType={panel.contentType as PanelContentType}
            initialState={panel.initialState}
            maximizable={panel.maximizable}
            closable={panel.closable}
            onStateChange={newState => onPanelStateChange?.(panel.id, newState)}
            onAction={action => handlePanelAction(panel.id, action)}
          />
        </div>
      ))}
      
      {onPanelAdd && (
        <button 
          className="add-panel-button"
          data-testid="add-panel-button"
          onClick={handleAddPanel}
        >
          <span className="add-icon">+</span>
          Add Panel
        </button>
      )}
    </div>
  );
}; 