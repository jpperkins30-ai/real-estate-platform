import React, { useState, useCallback } from 'react';
import { useAdvancedLayout } from '../../hooks/useAdvancedLayout';
import { LayoutType, PanelConfig } from '../../types/layout.types';
import { LayoutSelector } from './controls/LayoutSelector';
import './EnhancedMultiFrameContainer.css';

// Import standard layouts (these will need to be created later)
// Commented out for now to avoid immediate linter errors
/*
import { SinglePanelLayout } from './layouts/SinglePanelLayout';
import { DualPanelLayout } from './layouts/DualPanelLayout';
import { TriPanelLayout } from './layouts/TriPanelLayout';
import { QuadPanelLayout } from './layouts/QuadPanelLayout';
*/

// Import advanced layout
import { AdvancedLayout } from './layouts/AdvancedLayout';

// Types for our container props
interface EnhancedMultiFrameContainerProps {
  initialLayoutType?: LayoutType | 'advanced';
  initialPanels: PanelConfig[];
  persistLayout?: boolean;
  panelComponents: Record<string, React.ComponentType<any>>;
  storageKey?: string;
  className?: string;
}

/**
 * Enhanced Multi-Frame Container with support for standard and advanced layouts
 */
export const EnhancedMultiFrameContainer: React.FC<EnhancedMultiFrameContainerProps> = ({
  initialLayoutType = 'single',
  initialPanels,
  persistLayout = true,
  panelComponents,
  storageKey = 'enhanced-multi-frame-layout',
  className = '',
}) => {
  // Track the current layout type
  const [layoutType, setLayoutType] = useState<LayoutType | 'advanced'>(initialLayoutType);
  
  // Use the advanced layout hook for managing panel states
  const {
    panelStates,
    maximizedPanelId,
    isAnyPanelMaximized,
    handlePanelAction,
    resetLayout,
  } = useAdvancedLayout({
    initialPanels,
    storageKey,
    shouldPersist: persistLayout,
  });
  
  // Handler for layout type changes
  const handleLayoutChange = useCallback((newLayout: LayoutType | 'advanced') => {
    setLayoutType(newLayout);
    // If switching to a standard layout from advanced, reset any maximized panels
    if (newLayout !== 'advanced' && isAnyPanelMaximized) {
      handlePanelAction({
        type: 'restore',
        panelId: maximizedPanelId as string,
      });
    }
  }, [isAnyPanelMaximized, maximizedPanelId, handlePanelAction]);
  
  // Render a panel by ID
  const renderPanel = useCallback((panelId: string, isMaximized: boolean) => {
    const panel = panelStates.find(p => p.id === panelId);
    if (!panel) return null;
    
    const PanelComponent = panelComponents[panel.type];
    if (!PanelComponent) {
      console.error(`No component found for panel type: ${panel.type}`);
      return <div>Error: Unknown panel type {panel.type}</div>;
    }
    
    return <PanelComponent id={panelId} isMaximized={isMaximized} />;
  }, [panelStates, panelComponents]);
  
  return (
    <div className={`enhanced-multi-frame-container ${className}`}>
      <div className="layout-controls">
        <LayoutSelector
          currentLayout={layoutType}
          onLayoutChange={handleLayoutChange}
          includeAdvancedLayout={true}
          disabled={isAnyPanelMaximized}
        />
        
        {/* Additional controls could go here */}
        {layoutType === 'advanced' && (
          <button 
            onClick={resetLayout}
            className="reset-layout-button"
            title="Reset layout"
            aria-label="Reset layout"
          >
            Reset Layout
          </button>
        )}
      </div>
      
      <div className="layout-container">
        {/* 
          For now, we'll just render the advanced layout since the standard layouts
          haven't been implemented yet
        */}
        {layoutType === 'advanced' ? (
          <AdvancedLayout
            panelStates={panelStates}
            maximizedPanelId={maximizedPanelId}
            handlePanelAction={handlePanelAction}
            renderPanel={renderPanel}
            className="multi-frame-advanced-layout"
          />
        ) : (
          <div className="placeholder-layout">
            {/* 
              Placeholder for standard layouts
              In a complete implementation, we would render different layouts based on layoutType:
              
              {layoutType === 'single' && <SinglePanelLayout panels={visiblePanels} renderPanel={renderPanel} />}
              {layoutType === 'dual' && <DualPanelLayout panels={visiblePanels} renderPanel={renderPanel} />}
              {layoutType === 'tri' && <TriPanelLayout panels={visiblePanels} renderPanel={renderPanel} />}
              {layoutType === 'quad' && <QuadPanelLayout panels={visiblePanels} renderPanel={renderPanel} />}
            */}
            <div className="placeholder-message">
              {layoutType} layout would be displayed here
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 