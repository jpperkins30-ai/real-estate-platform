import React from 'react';
import { LayoutType } from '../../../types/layout.types';
import './LayoutSelector.css';

interface LayoutSelectorProps {
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
  
  return (
    <div className="layout-selector" data-testid="layout-selector">
      {layouts.includes('single') && (
        <button
          className={`layout-button ${currentLayout === 'single' ? 'active' : ''}`}
          onClick={() => onLayoutChange('single')}
          aria-label="Single panel layout"
          data-testid="layout-selector-single"
        >
          <div className="single-icon"></div>
          <span>Single</span>
        </button>
      )}
      
      {layouts.includes('dual') && (
        <button
          className={`layout-button ${currentLayout === 'dual' ? 'active' : ''}`}
          onClick={() => onLayoutChange('dual')}
          aria-label="Dual panel layout"
          data-testid="layout-selector-dual"
        >
          <div className="dual-icon"></div>
          <span>Dual</span>
        </button>
      )}
      
      {layouts.includes('tri') && (
        <button
          className={`layout-button ${currentLayout === 'tri' ? 'active' : ''}`}
          onClick={() => onLayoutChange('tri')}
          aria-label="Tri panel layout"
          data-testid="layout-selector-tri"
        >
          <div className="tri-icon"></div>
          <span>Tri</span>
        </button>
      )}
      
      {layouts.includes('quad') && (
        <button
          className={`layout-button ${currentLayout === 'quad' ? 'active' : ''}`}
          onClick={() => onLayoutChange('quad')}
          aria-label="Quad panel layout"
          data-testid="layout-selector-quad"
        >
          <div className="quad-icon"></div>
          <span>Quad</span>
        </button>
      )}
      
      {layouts.includes('advanced') && (
        <button
          className={`layout-button ${currentLayout === 'advanced' ? 'active' : ''}`}
          onClick={() => onLayoutChange('advanced')}
          aria-label="Advanced customizable layout"
          data-testid="layout-selector-advanced"
        >
          <div className="advanced-icon"></div>
          <span>Advanced</span>
        </button>
      )}
    </div>
  );
}; 