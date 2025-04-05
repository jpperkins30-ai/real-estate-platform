import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { useLayout } from '../../context/LayoutContext';
import { PanelContainer } from './PanelContainer';
import { PanelConfig } from '../../types/layout.types';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './GridLayoutPanel.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Layout presets based on layout type
const layoutPresets = {
  single: [
    { i: 'default', x: 0, y: 0, w: 12, h: 12, static: false }
  ],
  dual: [
    { i: 'left', x: 0, y: 0, w: 6, h: 12, static: false },
    { i: 'right', x: 6, y: 0, w: 6, h: 12, static: false }
  ],
  tri: [
    { i: 'top-left', x: 0, y: 0, w: 6, h: 6, static: false },
    { i: 'top-right', x: 6, y: 0, w: 6, h: 6, static: false },
    { i: 'bottom', x: 0, y: 6, w: 12, h: 6, static: false }
  ],
  quad: [
    { i: 'top-left', x: 0, y: 0, w: 6, h: 6, static: false },
    { i: 'top-right', x: 6, y: 0, w: 6, h: 6, static: false },
    { i: 'bottom-left', x: 0, y: 6, w: 6, h: 6, static: false },
    { i: 'bottom-right', x: 6, y: 6, w: 6, h: 6, static: false }
  ]
};

// Convert panel configurations to grid layout
const panelsToLayout = (panels: Record<string, PanelConfig>): Layout[] => {
  return Object.values(panels).map(panel => {
    const { id, position, size } = panel;
    const x = position?.col || 0;
    const y = position?.row || 0;
    const w = Math.round((size?.width || 50) / 100 * 12); // Convert percentage to grid units
    const h = Math.round((size?.height || 50) / 100 * 12);
    
    return { i: id, x, y, w, h, static: false };
  });
};

// Convert grid layout to panel configurations
const layoutToPanels = (layout: Layout[], panels: Record<string, PanelConfig>): Record<string, PanelConfig> => {
  const updatedPanels = { ...panels };
  
  layout.forEach(item => {
    const { i: id, x, y, w, h } = item;
    
    if (updatedPanels[id]) {
      updatedPanels[id] = {
        ...updatedPanels[id],
        position: { row: y, col: x },
        size: { 
          width: Math.round(w / 12 * 100), // Convert grid units to percentage
          height: Math.round(h / 12 * 100)
        }
      };
    }
  });
  
  return updatedPanels;
};

interface GridLayoutPanelProps {
  className?: string;
}

export const GridLayoutPanel: React.FC<GridLayoutPanelProps> = ({ className = '' }) => {
  const { state, updatePanelPosition, updatePanelSize } = useLayout();
  const { layoutType, panels, isInitialized } = state;
  
  // State for layout
  const [layouts, setLayouts] = useState({
    lg: layoutPresets[layoutType] || []
  });
  
  // Update layout when panels change
  useEffect(() => {
    if (isInitialized) {
      setLayouts({
        lg: panelsToLayout(panels)
      });
    } else {
      // Use default layout if not initialized
      setLayouts({
        lg: layoutPresets[layoutType] || []
      });
    }
  }, [layoutType, panels, isInitialized]);
  
  // Handle layout change
  const handleLayoutChange = (currentLayout: Layout[], allLayouts: any) => {
    // Update panel positions and sizes based on layout
    const updatedPanels = layoutToPanels(currentLayout, panels);
    
    // Update all panels at once
    Object.entries(updatedPanels).forEach(([id, panel]) => {
      if (panel.position) {
        updatePanelPosition(id, panel.position);
      }
      
      if (panel.size) {
        updatePanelSize(id, panel.size);
      }
    });
    
    // Save the new layout
    setLayouts({ lg: currentLayout });
  };
  
  // Render grid layout
  return (
    <div className={`grid-layout-panel ${className}`}>
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
        rowHeight={30}
        margin={[10, 10]}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".panel-header"
        resizeHandles={['se']}
      >
        {Object.values(panels).map(panel => (
          <div key={panel.id} className="grid-panel-wrapper">
            <PanelContainer
              id={panel.id}
              title={panel.title}
              contentType={panel.contentType}
              initialState={panel.state}
            />
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}; 