import React, { useState, useCallback, useEffect } from 'react';
import { LayoutSelector } from './controls/LayoutSelector';
import { AdvancedLayout } from './layouts/AdvancedLayout';
import { 
  PanelConfig, 
  LayoutConfig, 
  LayoutType, 
  AdvancedPanelConfig,
  AdvancedPanelPosition
} from '../../types/layout.types';
import './EnhancedMultiFrameContainer.css';

/**
 * Enhanced MultiFrame Container Props
 * This container is specialized for advanced layout scenarios with
 * more granular control over panel positioning and behavior.
 */
export interface EnhancedMultiFrameContainerProps {
  initialLayout?: LayoutType;
  panels?: AdvancedPanelConfig[];
  onLayoutChange?: (layout: LayoutConfig) => void;
  onPanelStateChange?: (panelId: string, newState: any) => void;
  onPanelClose?: (panelId: string) => void;
  onPanelAdd?: (newPanel: AdvancedPanelConfig) => void;
  className?: string;
  showLayoutSelector?: boolean;
  layoutOptions?: LayoutType[];
}

export const EnhancedMultiFrameContainer: React.FC<EnhancedMultiFrameContainerProps> = ({
  initialLayout = 'advanced',
  panels = [],
  onLayoutChange,
  onPanelStateChange,
  onPanelClose,
  onPanelAdd,
  className = '',
  showLayoutSelector = true,
  layoutOptions = ['advanced'],
}) => {
  // State
  const [layoutType, setLayoutType] = useState<LayoutType>(initialLayout);
  const [panelConfigs, setPanelConfigs] = useState<AdvancedPanelConfig[]>(panels);
  
  // Effect to initialize default panels if none provided
  useEffect(() => {
    if (panels.length === 0) {
      // Create default panels for an advanced layout
      const defaultPanels: AdvancedPanelConfig[] = [
        {
          id: 'panel-1',
          contentType: 'map',
          title: 'Map Panel',
          position: { x: 0, y: 0, width: 70, height: 70 },
          maximizable: true,
          closable: true
        },
        {
          id: 'panel-2',
          contentType: 'property',
          title: 'Property Panel',
          position: { x: 70, y: 0, width: 30, height: 70 },
          maximizable: true,
          closable: true
        },
        {
          id: 'panel-3',
          contentType: 'county',
          title: 'County Panel',
          position: { x: 0, y: 70, width: 100, height: 30 },
          maximizable: true,
          closable: true
        }
      ];
      
      setPanelConfigs(defaultPanels);
    }
  }, [panels.length]);
  
  // Handle layout change
  const handleLayoutChange = useCallback((newLayout: LayoutType) => {
    setLayoutType(newLayout);
    
    // Notify parent component
    if (onLayoutChange) {
      onLayoutChange({
        name: `${newLayout} layout`,
        type: newLayout,
        panels: panelConfigs
      });
    }
  }, [panelConfigs, onLayoutChange]);
  
  // Handle panel position change
  const handlePanelPositionChange = useCallback((panelId: string, newPosition: AdvancedPanelPosition) => {
    setPanelConfigs(prev => {
      const updated = prev.map(panel => {
        if (panel.id === panelId) {
          return { ...panel, position: newPosition };
        }
        return panel;
      });
      
      // Notify parent component
      if (onLayoutChange) {
        onLayoutChange({
          name: `${layoutType} layout`,
          type: layoutType,
          panels: updated
        });
      }
      
      return updated;
    });
  }, [layoutType, onLayoutChange]);
  
  // Handle panel state change
  const handlePanelStateChange = useCallback((panelId: string, newState: any) => {
    if (onPanelStateChange) {
      onPanelStateChange(panelId, newState);
    }
  }, [onPanelStateChange]);
  
  // Handle panel close
  const handlePanelClose = useCallback((panelId: string) => {
    setPanelConfigs(prev => {
      const updated = prev.filter(panel => panel.id !== panelId);
      
      // Notify parent component
      if (onLayoutChange) {
        onLayoutChange({
          name: `${layoutType} layout`,
          type: layoutType,
          panels: updated
        });
      }
      
      if (onPanelClose) {
        onPanelClose(panelId);
      }
      
      return updated;
    });
  }, [layoutType, onLayoutChange, onPanelClose]);
  
  // Handle adding a new panel
  const handlePanelAdd = useCallback((newPanel: AdvancedPanelConfig) => {
    setPanelConfigs(prev => {
      const updated = [...prev, newPanel];
      
      // Notify parent component
      if (onLayoutChange) {
        onLayoutChange({
          name: `${layoutType} layout`,
          type: layoutType,
          panels: updated
        });
      }
      
      if (onPanelAdd) {
        onPanelAdd(newPanel);
      }
      
      return updated;
    });
  }, [layoutType, onLayoutChange, onPanelAdd]);
  
  return (
    <div className={`enhanced-multi-frame-container ${className}`} data-testid="enhanced-multi-frame-container">
      {showLayoutSelector && (
        <div className="layout-controls">
          <LayoutSelector
            currentLayout={layoutType}
            onLayoutChange={handleLayoutChange}
            enableAdvancedLayout={true}
            availableLayouts={layoutOptions}
          />
        </div>
      )}
      <div className="advanced-layout-container" data-testid="advanced-layout-container">
        <AdvancedLayout 
          panels={panelConfigs}
          onPanelPositionChange={handlePanelPositionChange}
          onPanelStateChange={handlePanelStateChange}
          onPanelClose={handlePanelClose}
          onPanelAdd={handlePanelAdd}
        />
      </div>
    </div>
  );
}; 