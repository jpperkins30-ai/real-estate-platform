import React, { useCallback } from 'react';
import { ResizableBox, ResizeCallbackData } from 'react-resizable';
import './PanelResizer.css';

interface PanelResizerProps {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  lockAspectRatio?: boolean;
  handle?: React.ReactNode;
  onResize?: (size: { width: number; height: number }) => void;
  onResizeStart?: () => void;
  onResizeStop?: (size: { width: number; height: number }) => void;
  className?: string;
  children: React.ReactNode;
}

/**
 * Resizable wrapper component for panels
 */
export const PanelResizer: React.FC<PanelResizerProps> = ({
  width,
  height,
  minWidth = 150,
  minHeight = 150,
  maxWidth = Infinity,
  maxHeight = Infinity,
  lockAspectRatio = false,
  handle,
  onResize,
  onResizeStart,
  onResizeStop,
  className = '',
  children
}) => {
  const handleResize = useCallback((_e: React.SyntheticEvent, data: ResizeCallbackData) => {
    if (onResize) {
      onResize({
        width: data.size.width,
        height: data.size.height
      });
    }
  }, [onResize]);

  const handleResizeStart = useCallback(() => {
    if (onResizeStart) {
      onResizeStart();
    }
  }, [onResizeStart]);

  const handleResizeStop = useCallback((_e: React.SyntheticEvent, data: ResizeCallbackData) => {
    if (onResizeStop) {
      onResizeStop({
        width: data.size.width,
        height: data.size.height
      });
    }
  }, [onResizeStop]);

  // Default resize handles
  const renderDefaultHandles = () => {
    return {
      bottomRight: (
        <div className="panel-resize-handle-br" data-testid="resize-handle-br">
          <div className="resize-handle-icon"></div>
        </div>
      ),
      right: (
        <div className="panel-resize-handle-r" data-testid="resize-handle-r"></div>
      ),
      bottom: (
        <div className="panel-resize-handle-b" data-testid="resize-handle-b"></div>
      )
    };
  };
  
  const handles = handle ? { bottomRight: handle } : renderDefaultHandles();

  return (
    <ResizableBox
      width={width}
      height={height}
      minConstraints={[minWidth, minHeight]}
      maxConstraints={[maxWidth, maxHeight]}
      lockAspectRatio={lockAspectRatio}
      resizeHandles={['se', 'e', 's']}
      handle={handles}
      onResize={handleResize}
      onResizeStart={handleResizeStart}
      onResizeStop={handleResizeStop}
      className={`panel-resizer ${className}`}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      {children}
    </ResizableBox>
  );
};

