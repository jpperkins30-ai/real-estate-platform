/**
 * Standardized action types for panel operations
 */

/** Base action interface */
export interface BaseAction {
  type: string;
  panelId?: string;
  payload?: unknown;
}

/** Panel action types */
export interface PanelAction extends BaseAction {
  type: 'maximize' | 'restore' | 'refresh' | 'export' | 'close' | 'drag' | 'resize';
  payload?: {
    position?: { x: number; y: number; width: number; height: number };
    state?: Record<string, unknown>;
  };
}

/** Panel header specific action types */
export interface PanelHeaderAction extends BaseAction {
  type: 'maximize' | 'restore' | 'refresh' | 'export' | 'close';
  payload?: Record<string, unknown>;
}

/** Layout action types */
export interface LayoutAction extends BaseAction {
  type: 'changeLayout' | 'addPanel' | 'removePanel' | 'updatePanel';
  payload?: {
    layoutType?: string;
    panelConfig?: Record<string, unknown>;
    panelId?: string;
  };
} 