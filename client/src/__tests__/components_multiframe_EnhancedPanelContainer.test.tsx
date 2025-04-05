import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EnhancedMultiFrameContainer } from '../src/components/multiframe/EnhancedMultiFrameContainer';
import { LayoutType, LayoutConfig } from '../../../types/layout.types';

// Create mock components and hooks
vi.mock('../src/hooks/useAdvancedLayout', () => ({
  useAdvancedLayout: () => ({
    panelStates: [],
    maximizedPanelId: null,
    isAnyPanelMaximized: false,
    handlePanelAction: vi.fn(),
    resetLayout: vi.fn()
  })
}));

// Mock MultiFrameContainer component to verify it gets rendered
vi.mock('../src/components/multiframe/MultiFrameContainer', () => ({
  MultiFrameContainer: ({ 
    initialLayout, 
    defaultPanelContent 
  }: { 
    initialLayout: LayoutType; 
    defaultPanelContent: Record<string, string>; 
  }) => (
    <div data-testid="multi-frame-container">
      <div data-testid="layout-type">{initialLayout}</div>
      <div data-testid="panel-content">{JSON.stringify(defaultPanelContent)}</div>
    </div>
  )
}));

describe('EnhancedMultiFrameContainer', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders with default layout', () => {
    render(
      <EnhancedMultiFrameContainer
        initialLayout="single"
        defaultPanelContent={{ test: 'Test Content' }}
      />
    );
    
    // Check that the container is rendered
    expect(screen.getByTestId('enhanced-multi-frame-container')).toBeInTheDocument();
    // Check that the MultiFrameContainer is rendered with correct props
    expect(screen.getByTestId('layout-type').textContent).toBe('single');
  });

  it('renders with saved layouts', () => {
    const savedLayouts: LayoutConfig[] = [
      {
        id: 'layout1',
        name: 'Test Layout',
        type: 'dual',
        panels: [
          {
            id: 'panel1',
            contentType: 'map',
            title: 'Map Panel'
          }
        ]
      }
    ];

    render(
      <EnhancedMultiFrameContainer
        initialLayout="dual"
        savedLayouts={savedLayouts}
        defaultPanelContent={{ map: 'Map Content' }}
      />
    );
    
    // Check that the layout selector is rendered with the saved layout
    expect(screen.getByTestId('layout-selector')).toBeInTheDocument();
    // Check that the option with saved layout exists
    expect(screen.getByText('Test Layout')).toBeInTheDocument();
  });
}); 

