export type LayoutType = 'single' | 'dual' | 'tri' | 'quad';

export type PanelContentType = 
  | 'map'
  | 'state'
  | 'county'
  | 'property'
  | 'filter'
  | 'stats';

export interface PanelPosition {
  row: number;
  col: number;
}

export interface PanelSize {
  width: number; // Percentage of container width
  height: number; // Percentage of container height
}

export interface PanelConfig {
  id: string;
  title: string;
  contentType: string;
  position?: PanelPosition;
  initialState?: Record<string, any>;
}

export interface PanelContentConfig {
  type: string;
  title: string;
}

export interface DefaultPanelContent {
  [key: string]: string | PanelContentConfig;
}

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