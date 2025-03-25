// Minimal TypeScript definitions for Leaflet
declare module 'leaflet' {
  export function map(element: HTMLElement | string, options?: any): Map;
  export function tileLayer(urlTemplate: string, options?: any): TileLayer;
  export function geoJSON(geojson?: any, options?: any): GeoJSON;
  export function marker(latlng: LatLngExpression, options?: MarkerOptions): Marker;
  export function divIcon(options?: DivIconOptions): DivIcon;
  export function control(options?: ControlOptions): Control;
  export function popup(options?: PopupOptions): Popup;
  export function polygon(latlngs: LatLngExpression[], options?: PolylineOptions): Polygon;
  export function point(x: number, y: number, round?: boolean): Point;
  
  export class DomUtil {
    static create(tagName: string, className?: string, container?: HTMLElement): HTMLElement;
    static get(id: string): HTMLElement;
    static getStyle(el: HTMLElement, styleAttrib: string): string;
    static create(tagName: string, className?: string, container?: HTMLElement): HTMLElement;
  }
  
  export class DomEvent {
    static on(obj: HTMLElement | object, types: string, fn: Function, context?: object): object;
    static off(obj: HTMLElement | object, types?: string, fn?: Function, context?: object): object;
    static stopPropagation(ev: Event): void;
    static disableClickPropagation(el: HTMLElement): object;
    static preventDefault(ev: Event): void;
  }
  
  export interface LatLngLiteral {
    lat: number;
    lng: number;
  }
  
  export class LatLng {
    constructor(latitude: number, longitude: number, altitude?: number);
    lat: number;
    lng: number;
  }
  
  export type LatLngExpression = LatLng | LatLngLiteral | [number, number];
  
  export interface LatLngBounds {
    isValid(): boolean;
    extend(latlng: LatLngExpression | LatLngBounds): this;
    getSouthWest(): LatLng;
    getNorthEast(): LatLng;
    getCenter(): LatLng;
  }
  
  export interface Point {
    x: number;
    y: number;
  }
  
  export interface ControlOptions {
    position?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
  }
  
  export class Control {
    constructor(options?: ControlOptions);
    onAdd(map: Map): HTMLElement;
    onRemove(map: Map): void;
    getPosition(): string;
  }
  
  export interface MarkerOptions {
    icon?: Icon | DivIcon;
    keyboard?: boolean;
    title?: string;
    alt?: string;
    zIndexOffset?: number;
    opacity?: number;
    riseOnHover?: boolean;
    riseOffset?: number;
    draggable?: boolean;
  }
  
  export interface DivIconOptions {
    html?: string;
    bgPos?: Point;
    iconSize?: Point;
    iconAnchor?: Point;
    className?: string;
  }
  
  export class DivIcon extends Icon {
    constructor(options?: DivIconOptions);
  }
  
  export class Icon {
    static Default: Icon;
    constructor(options: any);
  }
  
  export interface PopupOptions {
    maxWidth?: number;
    minWidth?: number;
    maxHeight?: number;
    className?: string;
    offset?: Point;
  }
  
  export interface PolylineOptions {
    stroke?: boolean;
    color?: string;
    weight?: number;
    opacity?: number;
    lineCap?: string;
    lineJoin?: string;
    dashArray?: string;
    dashOffset?: string;
    fill?: boolean;
    fillColor?: string;
    fillOpacity?: number;
    fillRule?: string;
    bubblingMouseEvents?: boolean;
  }
  
  export class Layer {
    addTo(map: Map): this;
    remove(): this;
    removeFrom(map: Map): this;
    getElement(): HTMLElement | undefined;
    bindPopup(content: string | HTMLElement | Function | Popup, options?: PopupOptions): this;
    unbindPopup(): this;
    openPopup(latlng?: LatLngExpression): this;
    closePopup(): this;
    bindTooltip(content: string | HTMLElement | Function, options?: any): this;
    on(type: string, fn: Function, context?: any): this;
  }
  
  export class Marker extends Layer {
    constructor(latlng: LatLngExpression, options?: MarkerOptions);
  }
  
  export class Polygon extends Layer {
    constructor(latlngs: LatLngExpression[], options?: PolylineOptions);
    getBounds(): LatLngBounds;
  }
  
  export class Popup extends Layer {
    constructor(options?: PopupOptions, source?: Layer);
    setContent(content: string | HTMLElement): this;
  }
  
  export class Map {
    constructor(element: HTMLElement | string, options?: any);
    setView(center: LatLngExpression, zoom?: number, options?: any): this;
    flyTo(latlng: LatLngExpression, zoom?: number, options?: any): this;
    flyToBounds(bounds: LatLngBounds, options?: any): this;
    fitBounds(bounds: LatLngBounds, options?: any): this;
    addControl(control: Control): this;
    removeControl(control: Control): this;
    addLayer(layer: Layer): this;
    removeLayer(layer: Layer): this;
    getBounds(): LatLngBounds;
    getZoom(): number;
    remove(): this;
  }
  
  export class TileLayer extends Layer {
    constructor(urlTemplate: string, options?: any);
  }
  
  export class GeoJSON extends Layer {
    constructor(geojson?: any, options?: any);
    addData(data: any): this;
    resetStyle(layer?: Layer): this;
    getBounds(): LatLngBounds;
  }
}

export default {}; 