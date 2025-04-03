import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PanelHeader } from '../PanelHeader';

describe('PanelHeader', () => {
  const defaultProps = {
    title: 'Test Panel'
  };

  it('renders with title', () => {
    render(<PanelHeader {...defaultProps} />);
    expect(screen.getByText('Test Panel')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<PanelHeader {...defaultProps} className="custom-class" />);
    expect(screen.getByTestId('panel-header')).toHaveClass('custom-class');
  });

  it('renders with draggable class when draggable prop is true', () => {
    render(<PanelHeader {...defaultProps} draggable />);
    expect(screen.getByTestId('panel-header')).toHaveClass('draggable');
  });

  it('calls onToggleMaximize when maximize button is clicked', () => {
    const handleMaximize = vi.fn();
    render(<PanelHeader {...defaultProps} onToggleMaximize={handleMaximize} />);
    
    fireEvent.click(screen.getByLabelText('Maximize panel'));
    expect(handleMaximize).toHaveBeenCalledTimes(1);
  });

  it('calls onRefresh when refresh button is clicked', () => {
    const handleRefresh = vi.fn();
    render(<PanelHeader {...defaultProps} onRefresh={handleRefresh} />);
    
    fireEvent.click(screen.getByLabelText('Refresh panel'));
    expect(handleRefresh).toHaveBeenCalledTimes(1);
  });

  it('calls onExport when export button is clicked', () => {
    const handleExport = vi.fn();
    render(<PanelHeader {...defaultProps} onExport={handleExport} />);
    
    fireEvent.click(screen.getByLabelText('Export panel data'));
    expect(handleExport).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<PanelHeader {...defaultProps} onClose={handleClose} />);
    
    fireEvent.click(screen.getByLabelText('Close panel'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('shows maximize icon when not maximized', () => {
    render(<PanelHeader {...defaultProps} onToggleMaximize={vi.fn()} />);
    expect(screen.getByLabelText('Maximize panel')).toBeInTheDocument();
  });

  it('shows restore icon when maximized', () => {
    render(<PanelHeader {...defaultProps} onToggleMaximize={vi.fn()} isMaximized />);
    expect(screen.getByLabelText('Restore panel')).toBeInTheDocument();
  });

  it('renders custom controls', () => {
    const customControl = <button key="custom">Custom</button>;
    render(<PanelHeader {...defaultProps} customControls={customControl} />);
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('hides standard controls when showControls is false', () => {
    render(
      <PanelHeader 
        {...defaultProps} 
        showControls={false}
        onToggleMaximize={vi.fn()}
        onRefresh={vi.fn()}
        onExport={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.queryByLabelText('Maximize panel')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Refresh panel')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Export panel data')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Close panel')).not.toBeInTheDocument();
  });

  it('handles mouse enter and leave events', () => {
    render(<PanelHeader {...defaultProps} />);
    const header = screen.getByTestId('panel-header');

    fireEvent.mouseEnter(header);
    expect(header).toHaveStyle({
      backgroundColor: 'var(--header-hover-background-color, #f1f3f4)'
    });

    fireEvent.mouseLeave(header);
    expect(header).toHaveStyle({
      backgroundColor: 'var(--header-background-color, #f8f9fa)'
    });
  });

  it('truncates long titles', () => {
    const longTitle = 'This is a very long title that should be truncated with an ellipsis when it exceeds the available space';
    render(<PanelHeader title={longTitle} />);
    
    const titleElement = screen.getByText(longTitle);
    expect(titleElement).toHaveClass('panel-title');
  });
}); 