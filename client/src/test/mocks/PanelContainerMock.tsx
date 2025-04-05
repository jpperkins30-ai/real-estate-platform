import React, { ReactNode } from 'react';
import { vi } from 'vitest';
import { PanelContentType } from '../../types/layout.types';

// Define interface for component props
interface PanelContainerProps {
  id: string;
  title: string;
  contentType: PanelContentType;
  onAction?: (action: { type: string; [key: string]: any }) => void;
  maximizable?: boolean;
  closable?: boolean;
  children?: ReactNode;
}

// Create a mock for the PanelContainer component
const PanelContainer: React.FC<PanelContainerProps> = ({ 
  id, 
  title, 
  contentType, 
  onAction, 
  maximizable = false, 
  closable = false, 
  children 
}) => (
  <div data-testid={`panel-container-${id}`} className="mock-panel-container">
    <div data-testid={`panel-header-${id}`} className="mock-panel-header">
      <span data-testid={`panel-title-${id}`}>{title}</span>
      <div data-testid={`panel-actions-${id}`} className="mock-panel-actions">
        {maximizable && (
          <button 
            data-testid={`maximize-button-${id}`}
            onClick={() => onAction?.({ type: 'maximize' })}
            aria-label="Maximize panel"
          >
            Maximize
          </button>
        )}
        {closable && (
          <button 
            data-testid={`close-button-${id}`}
            onClick={() => onAction?.({ type: 'close' })}
            aria-label="Close panel"
          >
            Close
          </button>
        )}
      </div>
    </div>
    <div data-testid={`panel-content-${id}`} className="mock-panel-content">
      {children || (
        <div data-testid={`${contentType}-content-${id}`}>
          {contentType} Content
        </div>
      )}
    </div>
  </div>
);

// Set up mock functions for testing
(PanelContainer as any).mockImplementation = vi.fn();

export default PanelContainer; 