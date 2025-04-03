import React from 'react';
import { LayoutType } from '../../../types/layout.types';
import './LayoutSelector.css';

export interface LayoutSelectorProps {
  currentLayout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
  enableAdvancedLayout?: boolean;
  availableLayouts?: LayoutType[];
}

export const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  currentLayout,
  onLayoutChange,
  enableAdvancedLayout = false,
  availableLayouts = ['single', 'dual', 'tri', 'quad']
}) => {
  // If advanced layout is enabled, add it to available layouts
  const layouts = enableAdvancedLayout 
    ? [...availableLayouts, 'advanced'].filter((layout, index, self) => self.indexOf(layout) === index)
    : availableLayouts;
  
  const handleLayoutChange = (layout: LayoutType) => {
    if (layout !== currentLayout) {
      onLayoutChange(layout);
    }
  };

  return (
    <div className="layout-selector" data-testid="layout-selector">
      <div className="layout-buttons">
        {layouts.includes('single') && (
          <button
            className={`layout-button ${currentLayout === 'single' ? 'active' : ''}`}
            onClick={() => handleLayoutChange('single')}
            aria-label="Single panel layout"
            data-testid="layout-selector-single"
          >
            <div className="layout-icon single-layout-icon">
              <div className="panel-block"></div>
            </div>
            <span className="layout-label">Single</span>
          </button>
        )}
        
        {layouts.includes('dual') && (
          <button
            className={`layout-button ${currentLayout === 'dual' ? 'active' : ''}`}
            onClick={() => handleLayoutChange('dual')}
            aria-label="Dual panel layout"
            data-testid="layout-selector-dual"
          >
            <div className="layout-icon dual-layout-icon">
              <div className="panel-block left"></div>
              <div className="panel-block right"></div>
            </div>
            <span className="layout-label">Dual</span>
          </button>
        )}
        
        {layouts.includes('tri') && (
          <button
            className={`layout-button ${currentLayout === 'tri' ? 'active' : ''}`}
            onClick={() => handleLayoutChange('tri')}
            aria-label="Tri panel layout"
            data-testid="layout-selector-tri"
          >
            <div className="layout-icon tri-layout-icon">
              <div className="panel-block top-left"></div>
              <div className="panel-block top-right"></div>
              <div className="panel-block bottom"></div>
            </div>
            <span className="layout-label">Tri</span>
          </button>
        )}
        
        {layouts.includes('quad') && (
          <button
            className={`layout-button ${currentLayout === 'quad' ? 'active' : ''}`}
            onClick={() => handleLayoutChange('quad')}
            aria-label="Quad panel layout"
            data-testid="layout-selector-quad"
          >
            <div className="layout-icon quad-layout-icon">
              <div className="panel-block top-left"></div>
              <div className="panel-block top-right"></div>
              <div className="panel-block bottom-left"></div>
              <div className="panel-block bottom-right"></div>
            </div>
            <span className="layout-label">Quad</span>
          </button>
        )}
        
        {layouts.includes('advanced') && (
          <button
            className={`layout-button ${currentLayout === 'advanced' ? 'active' : ''}`}
            onClick={() => handleLayoutChange('advanced')}
            aria-label="Advanced customizable layout"
            data-testid="layout-selector-advanced"
          >
            <div className="layout-icon advanced-layout-icon">
              <div className="panel-block custom-1"></div>
              <div className="panel-block custom-2"></div>
              <div className="panel-block custom-3"></div>
            </div>
            <span className="layout-label">Advanced</span>
          </button>
        )}
      </div>
    </div>
  );
}; 