import { useState, useRef, useEffect, RefObject, useCallback } from 'react';

type ResizeDirection = 'right' | 'bottom' | 'corner';

interface Size {
  width: number;
  height: number;
}

interface ResizableOptions {
  enabled?: boolean;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: number;
  grid?: [number, number];
  onResizeStart?: (e: MouseEvent, direction: ResizeDirection) => void;
  onResizeEnd?: (size: Size) => void;
}

export function useResizable<T extends HTMLElement = HTMLDivElement>(
  initialSize: { width: number; height: number } = { width: 200, height: 200 },
  options: ResizableOptions = {}
): {
  isResizing: boolean;
  size: { width: number; height: number };
  ref: RefObject<T>;
  handleResizeStart: (e: React.MouseEvent, direction: ResizeDirection) => void;
} {
  const {
    enabled = true,
    minWidth = 100,
    minHeight = 100,
    maxWidth = Infinity,
    maxHeight = Infinity,
    aspectRatio,
    grid = [1, 1],
    onResizeStart,
    onResizeEnd
  } = options;

  const [isResizing, setIsResizing] = useState(false);
  const [size, setSize] = useState(initialSize);
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection | null>(null);
  const elementRef = useRef<T>(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startSizeRef = useRef(initialSize);

  // Handler for resize start
  const handleResizeStart = (e: React.MouseEvent, direction: ResizeDirection) => {
    if (!enabled) return;
    
    setIsResizing(true);
    setResizeDirection(direction);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    startSizeRef.current = { ...size };
    
    if (onResizeStart) {
      onResizeStart(e.nativeEvent, direction);
    }
    
    e.preventDefault();
  };

  // Handle mouse movement during resizing
  useEffect(() => {
    if (!isResizing || !resizeDirection) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate deltas and apply to size
      const deltaX = e.clientX - startPosRef.current.x;
      const deltaY = e.clientY - startPosRef.current.y;
      
      // Calculate new width and height based on resize direction
      let newWidth = startSizeRef.current.width;
      let newHeight = startSizeRef.current.height;
      
      // Apply changes based on direction
      if (resizeDirection === 'right' || resizeDirection === 'corner') {
        newWidth = startSizeRef.current.width + deltaX;
      }
      
      if (resizeDirection === 'bottom' || resizeDirection === 'corner') {
        newHeight = startSizeRef.current.height + deltaY;
      }
      
      // Apply grid
      newWidth = Math.round(newWidth / grid[0]) * grid[0];
      newHeight = Math.round(newHeight / grid[1]) * grid[1];
      
      // Apply constraints
      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
      
      // Apply aspect ratio if specified
      if (aspectRatio) {
        // If resizing from corner, maintain aspect ratio based on larger dimension
        if (resizeDirection === 'corner') {
          if (deltaX > deltaY) {
            newHeight = newWidth / aspectRatio;
          } else {
            newWidth = newHeight * aspectRatio;
          }
        } else if (resizeDirection === 'right') {
          newHeight = newWidth / aspectRatio;
        } else if (resizeDirection === 'bottom') {
          newWidth = newHeight * aspectRatio;
        }
        
        // Re-apply constraints after aspect ratio adjustment
        newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
        newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
      }
      
      setSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDirection(null);
      if (onResizeEnd) {
        onResizeEnd(size);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeDirection, grid, minWidth, minHeight, maxWidth, maxHeight, aspectRatio, size, onResizeEnd]);

  return {
    isResizing,
    size,
    ref: elementRef,
    handleResizeStart
  };
}

