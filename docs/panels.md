# Panel System Documentation

## Overview
The panel system provides a flexible and interactive way to display and manage content within the real estate platform. It supports dragging, resizing, and maximizing panels, with persistent state management.

## Components

### EnhancedPanelContainer
The root component that manages multiple panels within a layout.

```typescript
interface EnhancedPanelContainerProps {
  panels: PanelConfig[];
  onPanelStateChange?: (panelId: string, state: PanelState) => void;
  className?: string;
}
```

#### Features
- Dynamic panel layout management
- Panel state synchronization
- Custom styling support
- Layout persistence

### PanelHeader
A customizable header component for panels.

```typescript
interface PanelHeaderProps {
  title: string;
  isMaximized?: boolean;
  draggable?: boolean;
  onToggleMaximize?: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  onClose?: () => void;
  className?: string;
  customControls?: React.ReactNode;
  showControls?: boolean;
}
```

#### Features
- Title display with truncation
- Standard control buttons (maximize, refresh, export, close)
- Custom control support
- Drag handle functionality
- Hover state management

### DraggablePanel
A panel component that can be dragged around the container.

```typescript
interface DraggablePanelProps extends PanelConfig {
  children: React.ReactNode;
  onStateChange?: (state: PanelState) => void;
  className?: string;
}
```

#### Features
- Drag and drop functionality
- Position persistence
- State management
- Custom content support

## Custom Hooks

### useDraggable
A hook that implements dragging functionality.

```typescript
interface UseDraggableOptions {
  dragHandleSelector?: string;
  onDragStart?: (e: MouseEvent) => void;
  onDragEnd?: (e: MouseEvent) => void;
}

interface UseDraggableResult {
  ref: React.RefObject<HTMLElement>;
  isDragging: boolean;
  position: Position;
}
```

#### Usage
```typescript
const { ref, isDragging, position } = useDraggable({
  dragHandleSelector: '.panel-header',
  onDragEnd: handleDragEnd
});
```

### useResizable
A hook that implements resizing functionality.

```typescript
interface UseResizableOptions {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  onResizeEnd?: (size: Size) => void;
}

interface UseResizableResult {
  ref: React.RefObject<HTMLElement>;
  isResizing: boolean;
  size: Size;
}
```

#### Usage
```typescript
const { ref, isResizing, size } = useResizable({
  minWidth: 200,
  minHeight: 150,
  onResizeEnd: handleResizeEnd
});
```

## State Management

### Panel State
```typescript
interface PanelState {
  id: string;
  position: Position;
  size: Size;
  isMaximized: boolean;
  isVisible: boolean;
}
```

### Storage
- Panel states are persisted in localStorage
- Each panel's state is stored with a unique key
- State is restored on component mount

## Styling
- Uses CSS modules for component styling
- Supports custom class names
- Implements responsive design
- Handles various panel states (dragging, resizing, maximized)

## Best Practices
1. **Panel Configuration**
   - Provide unique IDs for each panel
   - Set appropriate size constraints
   - Implement state change handlers

2. **Performance**
   - Use memoization for expensive calculations
   - Implement debouncing for resize operations
   - Optimize drag performance

3. **Accessibility**
   - Provide ARIA labels
   - Support keyboard navigation
   - Maintain focus management

## Examples

### Basic Panel Setup
```typescript
const panels = [
  {
    id: 'panel1',
    title: 'Example Panel',
    position: { x: 0, y: 0 },
    size: { width: 400, height: 300 }
  }
];

<EnhancedPanelContainer
  panels={panels}
  onPanelStateChange={handleStateChange}
/>
```

### Custom Panel Controls
```typescript
const customControls = (
  <button onClick={handleCustomAction}>
    Custom Action
  </button>
);

<PanelHeader
  title="Panel with Custom Controls"
  customControls={customControls}
/>
```

## Related Documentation
- [Architecture Overview](./architecture.md)
- [Controller Integration](./controllers.md)
- [Testing Guide](./testing.md) 