import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PanelHeader } from '../../../components/multiframe/PanelHeader';

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
    
    fireEvent.click(screen.getByRole('button', { name: /maximize panel/i }));
    expect(handleMaximize).toHaveBeenCalledTimes(1);
  });

  it('shows restore icon when maximized', () => {
    render(
      <PanelHeader 
        {...defaultProps} 
        isMaximized={true} 
        onToggleMaximize={vi.fn()}
      />
    );
    
    expect(screen.getByRole('button', { name: /restore panel/i })).toBeInTheDocument();
  });

  it('calls onRefresh when refresh button is clicked', () => {
    const handleRefresh = vi.fn();
    render(<PanelHeader {...defaultProps} onRefresh={handleRefresh} />);
    
    fireEvent.click(screen.getByRole('button', { name: /refresh panel/i }));
    expect(handleRefresh).toHaveBeenCalledTimes(1);
  });

  it('calls onExport when export button is clicked', () => {
    const handleExport = vi.fn();
    render(<PanelHeader {...defaultProps} onExport={handleExport} />);
    
    fireEvent.click(screen.getByRole('button', { name: /export panel data/i }));
    expect(handleExport).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<PanelHeader {...defaultProps} onClose={handleClose} />);
    
    fireEvent.click(screen.getByRole('button', { name: /close panel/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders custom controls when provided', () => {
    const customControl = <button data-testid="custom-control">Custom</button>;
    render(<PanelHeader {...defaultProps} customControls={customControl} />);
    
    expect(screen.getByTestId('custom-control')).toBeInTheDocument();
  });

  it('does not render standard controls when showControls is false', () => {
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
    
    expect(screen.queryByRole('button', { name: /maximize panel/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /refresh panel/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /export panel data/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /close panel/i })).not.toBeInTheDocument();
  });

  it('handles mouse enter and leave events', () => {
    render(<PanelHeader {...defaultProps} />);
    const header = screen.getByTestId('panel-header');
    
    fireEvent.mouseEnter(header);
    expect(header).toHaveClass('hovered');
    
    fireEvent.mouseLeave(header);
    expect(header).not.toHaveClass('hovered');
  });

  it('truncates long titles with ellipsis', () => {
    const longTitle = 'This is a very long title that should be truncated with an ellipsis when it exceeds the available space';
    render(<PanelHeader title={longTitle} />);
    
    const titleElement = screen.getByText(longTitle);
    expect(titleElement).toHaveStyle({
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    });
  });
}); 