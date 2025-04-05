import React, { useState } from 'react';
import { PanelHeader } from './PanelHeader';
import { getPanelContent } from '../../services/panelContentRegistry';
import { PanelContentType } from '../../types/layout.types';
import './PanelContainer.css';

export interface PanelContainerProps {
  id: string;
  title: string;
  contentType: PanelContentType;
  initialState?: any;
  onStateChange?: (newState: any) => void;
  onAction?: (action: any) => void;
  className?: string;
  maximizable?: boolean;
  closable?: boolean;
}

export const PanelContainer: React.FC<PanelContainerProps> = ({
  id,
  title,
  contentType,
  initialState = {},
  onStateChange,
  onAction,
  className = '',
  maximizable = true,
  closable = false,
}) => {
  // State
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  
  // Handle panel actions
  const handleAction = (action: { type: string, payload?: any }) => {
    // Handle basic actions internally
    if (action.type === 'maximize' && maximizable) {
      setIsMaximized(prev => !prev);
    }
    
    // Pass action to parent if callback provided
    if (onAction) {
      onAction(action);
    }
  };
  
  // Get the appropriate content component for this panel
  const PanelContent = getPanelContent(contentType);
  
  // Class names based on state
  const containerClassNames = [
    'panel-container',
    isMaximized ? 'maximized' : '',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div 
      className={containerClassNames} 
      data-panel-id={id}
      data-testid={`panel-${id}`}
    >
      <PanelHeader 
        title={title} 
        isMaximized={isMaximized}
        onAction={handleAction}
        showMaximizeButton={maximizable}
        showCloseButton={closable}
      />
      <div className="panel-content">
        {PanelContent ? (
          <PanelContent
            panelId={id}
            initialState={initialState}
            onStateChange={onStateChange}
            onAction={handleAction}
          />
        ) : (
          <div className="no-content" data-testid="no-content">
            No content available for type: {contentType}
          </div>
        )}
      </div>
    </div>
  );
}; 