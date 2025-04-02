/**
 * Types for the Multi-Frame Layout system
 */

/** Standard layout types for the Multi-Frame Container */
export type LayoutType = 'single' | 'dual' | 'tri' | 'quad';

/** Position information for a panel */
export interface PanelPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex?: number;
}

/** Configuration for a panel in the advanced layout */
export interface PanelConfig {
  id: string;
  title: string;
  type: string;
  position: PanelPosition;
  isClosable?: boolean;
  isMaximizable?: boolean;
  isResizable?: boolean;
  isDraggable?: boolean;
  isVisible?: boolean;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

/** Panel state in the advanced layout */
export interface PanelState extends PanelConfig {
  isMaximized: boolean;
}

/** Action object for panel operations */
export interface PanelAction {
  type: 'maximize' | 'restore' | 'close' | 'move' | 'resize';
  panelId: string;
  payload?: Partial<PanelPosition>;
}

/** Options for the advanced layout hook */
export interface AdvancedLayoutOptions {
  initialPanels: PanelConfig[];
  storageKey?: string;
  shouldPersist?: boolean;
}

