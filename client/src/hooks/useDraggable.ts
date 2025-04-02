import { useState, useRef, useEffect, RefObject } from 'react';

interface DraggableOptions {
  enabled?: boolean;
  dragHandleSelector?: string;
  grid?: [number, number];
  bounds?: 'parent' | { left?: number; top?: number; right?: number; bottom?: number };
  onDragStart?: (e: MouseEvent) => void;
  onDragEnd?: (position: { x: number; y: number }) => void;
}

export function useDraggable<T extends HTMLElement = HTMLDivElement>(
  initialPosition: { x: number; y: number } = { x: 0, y: 0 },
  options: DraggableOptions = {}
): {
  isDragging: boolean;
  position: { x: number; y: number };
  ref: RefObject<T>;
  onMouseDown: (e: React.MouseEvent) => void;
} {
  const {
    enabled = true,
    dragHandleSelector,
    grid = [1, 1],
    bounds = 'parent',
    onDragStart,
    onDragEnd
  } = options;

  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(initialPosition);
  const elementRef = useRef<T>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const startPositionRef = useRef(initialPosition);
  const currentPositionRef = useRef(initialPosition);

  // Handlers for dragging operations
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!enabled) return;
    if (dragHandleSelector) {
      const target = e.target as HTMLElement;
      if (!target.closest(dragHandleSelector)) return;
    }

    setIsDragging(true);
    const rect = elementRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffsetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      startPositionRef.current = position;
      currentPositionRef.current = position;
    }
    if (onDragStart) onDragStart(e.nativeEvent);
    e.preventDefault();
  };

  // Handle mouse movement during dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!elementRef.current) return;
      
      // Safely handle the case where parent element might be null
      const parentElement = elementRef.current.parentElement;
      if (!parentElement) return;
      
      const parentRect = parentElement.getBoundingClientRect();
      
      // Calculate new position with grid snapping and bounds
      let newX = e.clientX - parentRect.left - dragOffsetRef.current.x;
      let newY = e.clientY - parentRect.top - dragOffsetRef.current.y;
      
      // Apply grid snapping
      newX = Math.round(newX / grid[0]) * grid[0];
      newY = Math.round(newY / grid[1]) * grid[1];
      
      // Apply bounds
      if (bounds === 'parent') {
        const elementRect = elementRef.current.getBoundingClientRect();
        const maxX = parentRect.width - elementRect.width;
        const maxY = parentRect.height - elementRect.height;
        
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));
      } else if (typeof bounds === 'object') {
        if (bounds.left !== undefined) newX = Math.max(bounds.left, newX);
        if (bounds.right !== undefined) newX = Math.min(bounds.right, newX);
        if (bounds.top !== undefined) newY = Math.max(bounds.top, newY);
        if (bounds.bottom !== undefined) newY = Math.min(bounds.bottom, newY);
      }
      
      const newPosition = { x: newX, y: newY };
      currentPositionRef.current = newPosition;
      setPosition(newPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      if (onDragEnd) {
        onDragEnd(currentPositionRef.current);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, grid, bounds, onDragEnd]);

  return {
    isDragging,
    position,
    ref: elementRef,
    onMouseDown: handleMouseDown
  };
}

