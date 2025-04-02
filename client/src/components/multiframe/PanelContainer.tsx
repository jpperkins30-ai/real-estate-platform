import React from 'react';
import { PanelContentType } from '../../types/layout.types';
import './PanelContainer.css';

interface PanelContainerProps {
  id: string;
  title: string;
  contentType: PanelContentType;
  initialState?: Record<string, any>;
  className?: string;
  maximizable?: boolean;
  closable?: boolean;
  onStateChange?: (newState: any) => void;
  onAction?: (action: any) => void;
}

export const PanelContainer: React.FC<PanelContainerProps> = ({
  id,
  title,
  contentType,
  initialState = {},
  className = '',
  maximizable = true,
  closable = false,
  onStateChange,
  onAction
}) => {
  const [isMaximized, setIsMaximized] = React.useState(false);

  const handleMaximize = () => {
    if (maximizable) {
      setIsMaximized(!isMaximized);
      onAction?.({ type: 'maximize', payload: !isMaximized });
    }
  };

  const handleClose = () => {
    if (closable) {
      onAction?.({ type: 'close' });
    }
  };

  return (
    <div 
      className={`panel-container ${isMaximized ? 'maximized' : ''} ${className}`}
      data-testid={`panel-${id}`}
      data-content-type={contentType}
    >
      <div className="panel-header">
        <h3 className="panel-title">{title}</h3>
        <div className="panel-controls">
          {maximizable && (
            <button
              className="panel-button maximize"
              onClick={handleMaximize}
              title={isMaximized ? 'Restore' : 'Maximize'}
              data-testid={`panel-maximize-${id}`}
            >
              {isMaximized ? '⤓' : '⤢'}
            </button>
          )}
          {closable && (
            <button
              className="panel-button close"
              onClick={handleClose}
              title="Close"
              data-testid={`panel-close-${id}`}
            >
              ×
            </button>
          )}
        </div>
      </div>
      <div className="panel-content" data-testid={`panel-content-${id}`}>
        {/* Panel content will be rendered here based on contentType */}
        <div className="panel-content-placeholder">
          Content type: {contentType}
        </div>
      </div>
    </div>
  );
}; 