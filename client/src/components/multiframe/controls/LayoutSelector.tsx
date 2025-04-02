import React from 'react';
import { LayoutType } from '../../../types/layout.types';
import './LayoutSelector.css';

interface LayoutSelectorProps {
  currentLayout: LayoutType | 'advanced';
  onLayoutChange: (layout: LayoutType | 'advanced') => void;
  includeAdvancedLayout?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Component for selecting the layout type for the MultiFrameContainer
 */
export const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  currentLayout,
  onLayoutChange,
  includeAdvancedLayout = false,
  disabled = false,
  className = '',
}) => {
  // Layout options
  const layouts: { type: LayoutType | 'advanced'; label: string; icon: string }[] = [
    {
      type: 'single',
      label: 'Single',
      icon: 'single-layout-icon',
    },
    {
      type: 'dual',
      label: 'Dual',
      icon: 'dual-layout-icon',
    },
    {
      type: 'tri',
      label: 'Tri',
      icon: 'tri-layout-icon',
    },
    {
      type: 'quad',
      label: 'Quad',
      icon: 'quad-layout-icon',
    },
  ];
  
  // Add advanced layout option if enabled
  if (includeAdvancedLayout) {
    layouts.push({
      type: 'advanced',
      label: 'Advanced',
      icon: 'advanced-layout-icon',
    });
  }
  
  return (
    <div className={`layout-selector ${className}`} data-testid="layout-selector">
      {layouts.map(layout => (
        <button
          key={layout.type}
          className={`layout-button ${currentLayout === layout.type ? 'active' : ''}`}
          onClick={() => onLayoutChange(layout.type)}
          disabled={disabled}
          title={`Switch to ${layout.label} layout`}
          data-testid={`layout-selector-${layout.type}`}
          aria-label={layout.label}
          aria-pressed={currentLayout === layout.type}
        >
          <span className={`layout-icon ${layout.icon}`}></span>
          <span className="layout-label">{layout.label}</span>
        </button>
      ))}
    </div>
  );
};

