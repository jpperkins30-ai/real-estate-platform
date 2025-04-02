import React, { useState, useCallback } from 'react';
import './PanelHeader.css';

interface PanelHeaderProps {
  title: string;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  onClose?: () => void;
  showControls?: boolean;
  customControls?: React.ReactNode;
  draggable?: boolean;
  className?: string;
}

export function PanelHeader({
  title,
  isMaximized = false,
  onToggleMaximize,
  onRefresh,
  onExport,
  onClose,
  showControls = true,
  customControls,
  draggable = false,
  className = ''
}: PanelHeaderProps) {
  // Handle mouse events
  const [isHovered, setIsHovered] = useState(false);
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);
  
  // Event handlers
  const handleMaximizeClick = useCallback(() => {
    if (onToggleMaximize) onToggleMaximize();
  }, [onToggleMaximize]);
  
  const handleRefreshClick = useCallback(() => {
    if (onRefresh) onRefresh();
  }, [onRefresh]);
  
  const handleExportClick = useCallback(() => {
    if (onExport) onExport();
  }, [onExport]);
  
  const handleCloseClick = useCallback(() => {
    if (onClose) onClose();
  }, [onClose]);
  
  // Generate CSS classes
  const headerClasses = [
    'panel-header',
    draggable ? 'draggable' : '',
    isHovered ? 'hovered' : '',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div 
      className={headerClasses}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-testid="panel-header"
    >
      <h3 className="panel-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</h3>
      
      <div className="panel-controls">
        {/* Custom controls */}
        {customControls}
        
        {/* Standard controls */}
        {showControls && (
          <div className="standard-controls">
            {onRefresh && (
              <button
                className="control-button"
                onClick={handleRefreshClick}
                aria-label="Refresh panel"
              >
                <span className="refresh-icon"></span>
              </button>
            )}
            
            {onExport && (
              <button
                className="control-button"
                onClick={handleExportClick}
                aria-label="Export panel data"
              >
                <span className="export-icon"></span>
              </button>
            )}
            
            {onToggleMaximize && (
              <button
                className={`control-button ${isMaximized ? 'active' : ''}`}
                onClick={handleMaximizeClick}
                aria-label={isMaximized ? 'Restore panel' : 'Maximize panel'}
              >
                <span className={isMaximized ? 'restore-icon' : 'maximize-icon'}></span>
              </button>
            )}
            
            {onClose && (
              <button
                className="control-button close-button"
                onClick={handleCloseClick}
                aria-label="Close panel"
              >
                <span className="close-icon"></span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 