// Test Case 801: Verify PanelHeader renders title and controls
// Test Case TC801: Verify PanelHeader renders title and controls
// Test Case TC801: Verify PanelHeader renders title and controls
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PanelHeader } from '../../src/components/multiframe/PanelHeader';

describe('PanelHeader', () => {
  const defaultProps = {
    title: 'Test Panel',
    onAction: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it('calls onAction with maximize action when maximize button is clicked', () => {
    render(<PanelHeader {...defaultProps} />);
    fireEvent.click(screen.getByTestId('maximize-button'));
    expect(defaultProps.onAction).toHaveBeenCalledWith({ type: 'maximize' });
  });

  it('shows restore icon when maximized', () => {
    render(<PanelHeader {...defaultProps} isMaximized={true} />);
    const maximizeButton = screen.getByTestId('maximize-button');
    expect(maximizeButton.getAttribute('aria-label')).toBe('Restore panel');
    expect(maximizeButton.querySelector('.restore-icon')).toBeInTheDocument();
  });

  it('calls onAction with refresh action when refresh button is clicked', () => {
    render(<PanelHeader {...defaultProps} />);
    fireEvent.click(screen.getByTestId('refresh-button'));
    expect(defaultProps.onAction).toHaveBeenCalledWith({ type: 'refresh' });
  });

  it('calls onAction with export action when export button is clicked', () => {
    render(<PanelHeader {...defaultProps} />);
    fireEvent.click(screen.getByTestId('export-button'));
    expect(defaultProps.onAction).toHaveBeenCalledWith({ type: 'export' });
  });

  it('calls onAction with close action when close button is clicked', () => {
    render(<PanelHeader {...defaultProps} showCloseButton={true} />);
    fireEvent.click(screen.getByTestId('close-button'));
    expect(defaultProps.onAction).toHaveBeenCalledWith({ type: 'close' });
  });

  it('does not show close button by default', () => {
    render(<PanelHeader {...defaultProps} />);
    expect(screen.queryByTestId('close-button')).not.toBeInTheDocument();
  });

  it('can hide maximize button when showMaximizeButton is false', () => {
    render(<PanelHeader {...defaultProps} showMaximizeButton={false} />);
    expect(screen.queryByTestId('maximize-button')).not.toBeInTheDocument();
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
      />
    );
    
    expect(screen.queryByTestId('refresh-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('export-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('maximize-button')).not.toBeInTheDocument();
  });
}); 




