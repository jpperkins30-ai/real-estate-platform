import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LayoutSelector } from '../../src/components/multiframe/controls/LayoutSelector';

describe('LayoutSelector', () => {
  it('renders standard layout options by default', () => {
    const onLayoutChange = vi.fn();
    
    render(
      <LayoutSelector
        currentLayout="single"
        onLayoutChange={onLayoutChange}
      />
    );
    
    expect(screen.getByTestId('layout-selector')).toBeInTheDocument();
    expect(screen.getByTestId('layout-selector-single')).toBeInTheDocument();
    expect(screen.getByTestId('layout-selector-dual')).toBeInTheDocument();
    expect(screen.getByTestId('layout-selector-tri')).toBeInTheDocument();
    expect(screen.getByTestId('layout-selector-quad')).toBeInTheDocument();
    expect(screen.queryByTestId('layout-selector-advanced')).not.toBeInTheDocument();
  });
  
  it('shows advanced layout option when enabled', () => {
    const onLayoutChange = vi.fn();
    
    render(
      <LayoutSelector
        currentLayout="single"
        onLayoutChange={onLayoutChange}
        enableAdvancedLayout={true}
      />
    );
    
    expect(screen.getByTestId('layout-selector-advanced')).toBeInTheDocument();
  });
  
  it('marks the current layout button as active', () => {
    const onLayoutChange = vi.fn();
    
    render(
      <LayoutSelector
        currentLayout="dual"
        onLayoutChange={onLayoutChange}
      />
    );
    
    const dualButton = screen.getByTestId('layout-selector-dual');
    expect(dualButton.className).toContain('active');
  });
  
  it('calls onLayoutChange when a layout button is clicked', () => {
    const onLayoutChange = vi.fn();
    
    render(
      <LayoutSelector
        currentLayout="single"
        onLayoutChange={onLayoutChange}
        enableAdvancedLayout={true}
      />
    );
    
    // Test standard layout selection
    fireEvent.click(screen.getByTestId('layout-selector-tri'));
    expect(onLayoutChange).toHaveBeenCalledWith('tri');
    
    // Test advanced layout selection
    fireEvent.click(screen.getByTestId('layout-selector-advanced'));
    expect(onLayoutChange).toHaveBeenCalledWith('advanced');
  });
  
  it('only renders available layouts', () => {
    const onLayoutChange = vi.fn();
    
    render(
      <LayoutSelector
        currentLayout="single"
        onLayoutChange={onLayoutChange}
        availableLayouts={['single', 'dual']}
      />
    );
    
    expect(screen.getByTestId('layout-selector-single')).toBeInTheDocument();
    expect(screen.getByTestId('layout-selector-dual')).toBeInTheDocument();
    expect(screen.queryByTestId('layout-selector-tri')).not.toBeInTheDocument();
    expect(screen.queryByTestId('layout-selector-quad')).not.toBeInTheDocument();
  });

  it('filters available layouts based on availableLayouts prop', () => {
    const onLayoutChange = vi.fn();
    
    render(
      <LayoutSelector
        currentLayout="single"
        onLayoutChange={onLayoutChange}
        availableLayouts={['single', 'dual']}
      />
    );
    
    // Only 'single' and 'dual' buttons should be present
    expect(screen.getByTestId('layout-selector-single')).toBeInTheDocument();
    expect(screen.getByTestId('layout-selector-dual')).toBeInTheDocument();
    expect(screen.queryByTestId('layout-selector-tri')).not.toBeInTheDocument();
    expect(screen.queryByTestId('layout-selector-quad')).not.toBeInTheDocument();
  });

  it('adds advanced layout to available layouts when enabled', () => {
    const onLayoutChange = vi.fn();
    
    render(
      <LayoutSelector
        currentLayout="single"
        onLayoutChange={onLayoutChange}
        enableAdvancedLayout={true}
        availableLayouts={['single', 'dual']}
      />
    );
    
    // 'single', 'dual', and 'advanced' buttons should be present
    expect(screen.getByTestId('layout-selector-single')).toBeInTheDocument();
    expect(screen.getByTestId('layout-selector-dual')).toBeInTheDocument();
    expect(screen.getByTestId('layout-selector-advanced')).toBeInTheDocument();
  });

  it('has proper ARIA attributes for accessibility', () => {
    const onLayoutChange = vi.fn();
    
    render(
      <LayoutSelector
        currentLayout="single"
        onLayoutChange={onLayoutChange}
      />
    );
    
    // Check ARIA attributes
    expect(screen.getByTestId('layout-selector-single')).toHaveAttribute('aria-label', 'Single panel layout');
    expect(screen.getByTestId('layout-selector-dual')).toHaveAttribute('aria-label', 'Dual panel layout');
    expect(screen.getByTestId('layout-selector-tri')).toHaveAttribute('aria-label', 'Tri panel layout');
    expect(screen.getByTestId('layout-selector-quad')).toHaveAttribute('aria-label', 'Quad panel layout');
  });
}); 

