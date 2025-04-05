// Layout Types
export type LayoutType = 'single' | 'dual' | 'tri' | 'quad' | 'advanced';

// Panel Content Types
export type PanelContentType = 'map' | 'state' | 'county' | 'property' | 'filter' | 'stats' | 'chart';

// Panel Position - Standard Layout (Row/Column based)
export interface PanelPosition {
  row: number;
  col: number;
}

// Panel Position - Advanced Layout (X/Y/Width/Height based)
export interface AdvancedPanelPosition {
  x: number;      // Position from left (percentage of container width)
  y: number;      // Position from top (percentage of container height)
  width: number;  // Percentage of container width
  height: number; // Percentage of container height
}

// Panel Size for Standard Layouts
export interface PanelSize {
  width: number;  // Percentage of container width
  height: number; // Percentage of container height
}

// Base Panel Configuration
export interface PanelConfigBase {
  id: string;
  contentType: PanelContentType;
  title: string;
  state?: any;
  visible?: boolean;
  closable?: boolean;
  maximizable?: boolean;
}

// Standard Panel Configuration
export interface StandardPanelConfig extends PanelConfigBase {
  position?: PanelPosition;
  size?: PanelSize;
}

// Advanced Panel Configuration
export interface AdvancedPanelConfig extends PanelConfigBase {
  position: AdvancedPanelPosition;
}

// Union type for panel configuration
export type PanelConfig = StandardPanelConfig | AdvancedPanelConfig;

// Layout Configuration
export interface LayoutConfig {
  id?: string;
  name: string;
  description?: string;
  type: LayoutType;
  panels: PanelConfig[];
  isDefault?: boolean;
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Helper to determine if a panel config is an advanced panel config
export function isAdvancedPanelConfig(config: PanelConfig): config is AdvancedPanelConfig {
  return 'position' in config && 
         'x' in (config.position as AdvancedPanelPosition) && 
         'y' in (config.position as AdvancedPanelPosition);
} 