export type LayoutType = 'single' | 'dual' | 'tri' | 'quad' | 'advanced';

export type PanelContentType = 'map' | 'state' | 'county' | 'property' | 'filter' | 'stats' | 'chart';

export interface PanelPosition {
  row: number;
  col: number;
}

export interface AdvancedPanelPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PanelSize {
  width: number;
  height: number;
}

export interface PanelConfigBase {
  id: string;
  contentType: PanelContentType;
  title: string;
  state?: any;
  visible?: boolean;
  closable?: boolean;
  maximizable?: boolean;
}

export interface StandardPanelConfig extends PanelConfigBase {
  position?: PanelPosition;
  size?: PanelSize;
}

export interface AdvancedPanelConfig extends PanelConfigBase {
  position: AdvancedPanelPosition;
}

export type PanelConfig = StandardPanelConfig | AdvancedPanelConfig;

export interface MultiFrameContainerProps {
  initialLayout: LayoutType;
  defaultPanelContent: DefaultPanelContent;
  onLayoutChange?: (layout: LayoutType) => void;
}

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

export function isAdvancedPanelConfig(config: PanelConfig): config is AdvancedPanelConfig {
  return 'position' in config && 
         'x' in (config.position as AdvancedPanelPosition) && 
         'y' in (config.position as AdvancedPanelPosition);
}

export interface PanelContentConfig {
  type: string;
  title: string;
}

export interface DefaultPanelContent {
  [key: string]: string | PanelContentConfig;
} 