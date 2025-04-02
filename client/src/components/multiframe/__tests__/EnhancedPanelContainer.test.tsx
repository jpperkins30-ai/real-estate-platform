import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EnhancedMultiFrameContainer } from '../../../components/multiframe/EnhancedMultiFrameContainer';

// Create mock components and hooks
vi.mock('../../../hooks/useAdvancedLayout', () => ({
  useAdvancedLayout: () => ({
    panelStates: [],
    maximizedPanelId: null,
    isAnyPanelMaximized: false,
    handlePanelAction: vi.fn(),
    resetLayout: vi.fn()
  })
}));

// Mock test panel component
const TestPanelComponent: React.FC<{ id: string; isMaximized: boolean }> = ({ id, isMaximized }) => (
  <div data-testid={`panel-${id}`}>
    Test Panel {id} {isMaximized ? '(maximized)' : ''}
  </div>
);

describe('EnhancedMultiFrameContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default layout', () => {
    render(
      <EnhancedMultiFrameContainer
        initialPanels={[
          {
            id: 'test-panel',
            title: 'Test Panel',
            type: 'test',
            position: { x: 0, y: 0, width: 400, height: 300 }
          }
        ]}
        panelComponents={{
          'test': TestPanelComponent
        }}
      />
    );
    
    expect(screen.getByText(/layout would be displayed here/i)).toBeInTheDocument();
  });

  it('renders with advanced layout', () => {
    render(
      <EnhancedMultiFrameContainer
        initialLayoutType="advanced"
        initialPanels={[
          {
            id: 'test-panel',
            title: 'Test Panel',
            type: 'test',
            position: { x: 0, y: 0, width: 400, height: 300 }
          }
        ]}
        panelComponents={{
          'test': TestPanelComponent
        }}
      />
    );
    
    expect(screen.getByText(/Reset Layout/i)).toBeInTheDocument();
  });
}); 