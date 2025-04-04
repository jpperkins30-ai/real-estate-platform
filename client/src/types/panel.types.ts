import { PanelContentType } from './layout.types';

/**
 * Standard interface for panel content components
 */
export interface PanelContentProps {
  /**
   * Unique identifier for the panel
   */
  panelId: string;
  
  /**
   * Type of content the panel is displaying
   */
  contentType?: PanelContentType;
  
  /**
   * Initial state to hydrate the panel with
   */
  initialState?: any;
  
  /**
   * Callback when state changes in the panel
   */
  onStateChange?: (newState: any) => void;
  
  /**
   * Callback for panel actions (commands/requests sent from panel to container)
   */
  onAction?: (action: PanelAction) => void;
  
  /**
   * Whether the panel is the active/focused panel
   */
  isActive?: boolean;
  
  /**
   * Optional className to apply to panel content
   */
  className?: string;
}

/**
 * Panel action that can be triggered by panels
 */
export interface PanelAction {
  /**
   * Type of action
   */
  type: string;
  
  /**
   * Additional data for the action
   */
  payload?: any;
  
  /**
   * Source panel ID that triggered the action
   */
  source?: string;
}

/**
 * Interface for panel components that can provide metadata
 */
export interface PanelWithMetadata {
  /**
   * Get panel metadata
   */
  getMetadata: () => PanelMetadata;
}

/**
 * Metadata for panel components
 */
export interface PanelMetadata {
  /**
   * Supported actions the panel can receive
   */
  supportedActions?: string[];
  
  /**
   * Actions the panel can emit
   */
  emittedActions?: string[];
  
  /**
   * Version of the panel implementation
   */
  version?: string;
  
  /**
   * Additional capabilities/features of this panel
   */
  capabilities?: string[];
} 