import React, { useCallback } from 'react';
import './PanelHeader.css';

interface PanelHeaderProps {
  title: string;
  isMaximized?: boolean;
  onAction: (action: any) => void;
  showMaximizeButton?: boolean;
  showCloseButton?: boolean;
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({
  title,
  isMaximized = false,
  onAction,
  showMaximizeButton = true,
  showCloseButton = false
}) => {
  const handleMaximizeClick = useCallback(() => {
    onAction({ type: 'maximize' });
  }, [onAction]);
  
  const handleRefreshClick = useCallback(() => {
    onAction({ type: 'refresh' });
  }, [onAction]);
  
  const handleExportClick = useCallback(() => {
    onAction({ type: 'export' });
  }, [onAction]);
  
  const handleCloseClick = useCallback(() => {
    onAction({ type: 'close' });
  }, [onAction]);
  
  return (
    <div className="panel-header">
      <h3 className="panel-title">{title}</h3>
      <div className="panel-actions">
        <button
          className="action-button"
          onClick={handleRefreshClick}
          aria-label="Refresh panel"
          data-testid="refresh-button"
        >
          <span className="refresh-icon"></span>
        </button>
        <button
          className="action-button"
          onClick={handleExportClick}
          aria-label="Export panel data"
          data-testid="export-button"
        >
          <span className="export-icon"></span>
        </button>
        {showMaximizeButton && (
          <button
            className={`action-button ${isMaximized ? 'active' : ''}`}
            onClick={handleMaximizeClick}
            aria-label={isMaximized ? 'Restore panel' : 'Maximize panel'}
            data-testid="maximize-button"
          >
            <span className={isMaximized ? 'restore-icon' : 'maximize-icon'}></span>
          </button>
        )}
        {showCloseButton && (
          <button
            className="action-button"
            onClick={handleCloseClick}
            aria-label="Close panel"
            data-testid="close-button"
          >
            <span className="close-icon"></span>
          </button>
        )}
      </div>
    </div>
  );
}; 