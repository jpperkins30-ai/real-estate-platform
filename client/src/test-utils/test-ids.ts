/**
 * Standardized test IDs for components
 */

// Panel Header Test IDs
export const PANEL_HEADER_TEST_IDS = {
  container: (panelId: string) => `panel-header-${panelId}`,
  title: (panelId: string) => `panel-header-title-${panelId}`,
  maximizeButton: (panelId: string) => `panel-header-maximize-${panelId}`,
  restoreButton: (panelId: string) => `panel-header-restore-${panelId}`,
  closeButton: (panelId: string) => `panel-header-close-${panelId}`,
  refreshButton: (panelId: string) => `panel-header-refresh-${panelId}`,
  exportButton: (panelId: string) => `panel-header-export-${panelId}`,
} as const;

// Draggable Panel Test IDs
export const DRAGGABLE_PANEL_TEST_IDS = {
  container: (panelId: string) => `draggable-panel-${panelId}`,
  content: (panelId: string) => `draggable-panel-content-${panelId}`,
  resizeHandle: (panelId: string, position: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw') => 
    `draggable-panel-resize-${position}-${panelId}`,
} as const;

// Controller Wizard Test IDs
export const CONTROLLER_WIZARD_TEST_IDS = {
  container: 'controller-wizard',
  status: 'controller-wizard-status',
  navigation: 'controller-wizard-navigation',
  error: 'controller-wizard-error',
} as const;

// Common Test IDs
export const COMMON_TEST_IDS = {
  loading: 'loading-spinner',
  error: 'error-message',
  empty: 'empty-state',
} as const; 