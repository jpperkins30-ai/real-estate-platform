import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { PanelConfig, AdvancedPanelPosition, PanelContentType } from '../types/layout.types';

// Mock version of the providers
// Create simple mock versions of context providers
const MockLayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div data-testid="mock-layout-provider">{children}</div>;
};

const MockPanelSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div data-testid="mock-panel-sync-provider">{children}</div>;
};

interface ProvidersProps {
  children: React.ReactNode;
}

// Add any providers your components need
const AllTheProviders: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <MemoryRouter>
      <MockPanelSyncProvider>
        {children}
      </MockPanelSyncProvider>
    </MemoryRouter>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Helper function to create props for PanelHeader tests
export const createPanelHeaderProps = (overrides = {}) => ({
  title: 'Test Panel',
  isMaximized: false,
  onAction: vi.fn(),
  showMaximizeButton: true,
  showCloseButton: false,
  className: '',
  draggable: false,
  showControls: true,
  ...overrides
});

// Helper function to create standardized panel config for tests
export function createMockPanelConfig(overrides = {}): PanelConfig {
  return {
    id: 'panel-1',
    contentType: 'map' as PanelContentType,
    title: 'Map Panel',
    position: { 
      x: 0, 
      y: 0, 
      width: 70, 
      height: 70 
    } as AdvancedPanelPosition,
    maximizable: true,
    closable: true,
    visible: true,
    ...overrides
  };
}

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };

// Export user event
export const user = {
  click: async (element: HTMLElement) => {
    element.click();
  }
};

// Helper function to wait for elements to appear
export const waitForElement = async (callback: () => HTMLElement | null, timeout = 5000) => {
  let element: HTMLElement | null = null;
  let attempts = 0;
  const maxAttempts = timeout / 10;
  
  while (!element && attempts < maxAttempts) {
    element = callback();
    if (!element) {
      await new Promise(resolve => setTimeout(resolve, 10));
      attempts++;
    }
  }
  
  return element;
};

// Debug DOM helper
export const debugDOM = () => {
  console.log(document.body.innerHTML);
};

// Export commonly used test utilities
export const mockPanelSync = {
  broadcast: vi.fn(),
  subscribe: () => vi.fn(),
  unsubscribe: vi.fn(),
};

export const mockLayoutContext = {
  registerPanel: vi.fn(),
  unregisterPanel: vi.fn(),
  updatePanelConfig: vi.fn(),
};

// Helper function to create mock panel data
export const createMockPanel = (overrides = {}) => ({
  id: 'test-panel',
  title: 'Test Panel',
  type: 'test',
  position: {
    x: 0,
    y: 0,
    width: 300,
    height: 200,
    zIndex: 1
  },
  isClosable: true,
  isMaximizable: true,
  isResizable: true,
  isDraggable: true,
  isVisible: true,
  minWidth: 200,
  minHeight: 150,
  maxWidth: 800,
  maxHeight: 600,
  isMaximized: false,
  ...overrides
});

// Helper function to create mock panel state
export const createMockPanelState = (overrides = {}) => ({
  ...createMockPanel(),
  state: {
    data: null,
    loading: false,
    error: null
  },
  ...overrides
});

// Mock data utilities
export const createMockData = {
  panel: createMockPanel,
  panelState: createMockPanelState,
  panelConfig: createMockPanelConfig,
  sync: mockPanelSync,
  layout: mockLayoutContext
};

// Helper to create mock responses with correct types
export const createControllerStatusMock = (overrides = {}) => ({
  hasController: false,
  status: null,
  lastRun: null,
  nextRun: '',
  runCount: 0,
  errorCount: 0,
  controllerType: '',
  controllerName: '',
  ...overrides
}); 