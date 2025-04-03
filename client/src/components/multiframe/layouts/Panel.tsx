import React, { useState } from 'react';
import { PanelConfig } from '../../../types/layout.types';
import './Panel.css';

interface PanelProps {
  config: PanelConfig;
  onMaximize?: (panelId: string) => void;
  onClose?: (panelId: string) => void;
  children?: React.ReactNode;
}

export const Panel: React.FC<PanelProps> = ({
  config,
  onMaximize,
  onClose,
  children,
}) => {
  const [isMaximized, setIsMaximized] = useState(false);

  const handleMaximize = () => {
    if (config.maximizable) {
      setIsMaximized(!isMaximized);
      onMaximize?.(config.id);
    }
  };

  const handleClose = () => {
    if (config.closable) {
      onClose?.(config.id);
    }
  };

  return (
    <div
      className={`panel ${isMaximized ? 'maximized' : ''}`}
      data-testid={`panel-${config.id}`}
      data-content-type={config.contentType}
    >
      <div className="panel-header">
        <h3 className="panel-title">{config.title}</h3>
        <div className="panel-controls">
          {config.maximizable && (
            <button
              className="panel-button maximize"
              onClick={handleMaximize}
              title={isMaximized ? 'Restore' : 'Maximize'}
              data-testid={`panel-maximize-${config.id}`}
            >
              {isMaximized ? '⤓' : '⤢'}
            </button>
          )}
          {config.closable && (
            <button
              className="panel-button close"
              onClick={handleClose}
              title="Close"
              data-testid={`panel-close-${config.id}`}
            >
              ×
            </button>
          )}
        </div>
      </div>
      <div className="panel-content" data-testid={`panel-content-${config.id}`}>
        {children}
      </div>
    </div>
  );
}; 