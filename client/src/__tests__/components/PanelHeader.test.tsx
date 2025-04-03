import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PanelHeader } from '../../components/multiframe/PanelHeader';
import { renderWithRouter, createPanelHeaderProps } from '../../test-utils';

describe('PanelHeader', () => {
  it('renders the panel title correctly', () => {
    renderWithRouter(<PanelHeader {...createPanelHeaderProps()} />);
    expect(screen.getByText('Test Panel')).toBeInTheDocument();
  });

  it('calls onAction with maximize type when maximize button is clicked', () => {
    const onAction = vi.fn();
    renderWithRouter(
      <PanelHeader 
        {...createPanelHeaderProps({ onAction })} 
      />
    );
    
    fireEvent.click(screen.getByTestId('maximize-button'));
    
    expect(onAction).toHaveBeenCalledWith({ 
      type: 'maximize'
    });
  });

  it('calls onAction with close type when close button is clicked', () => {
    const onAction = vi.fn();
    renderWithRouter(
      <PanelHeader 
        {...createPanelHeaderProps({ onAction, showCloseButton: true })} 
      />
    );
    
    fireEvent.click(screen.getByTestId('close-button'));
    
    expect(onAction).toHaveBeenCalledWith({ 
      type: 'close'
    });
  });

  it('calls onAction with refresh type when refresh button is clicked', () => {
    const onAction = vi.fn();
    renderWithRouter(
      <PanelHeader 
        {...createPanelHeaderProps({ onAction })} 
      />
    );
    
    fireEvent.click(screen.getByTestId('refresh-button'));
    
    expect(onAction).toHaveBeenCalledWith({ 
      type: 'refresh'
    });
  });

  it('calls onAction with export type when export button is clicked', () => {
    const onAction = vi.fn();
    renderWithRouter(
      <PanelHeader 
        {...createPanelHeaderProps({ onAction })} 
      />
    );
    
    fireEvent.click(screen.getByTestId('export-button'));
    
    expect(onAction).toHaveBeenCalledWith({ 
      type: 'export'
    });
  });

  it('has appropriate accessibility attributes', () => {
    renderWithRouter(<PanelHeader {...createPanelHeaderProps()} />);
    
    expect(screen.getByTestId('maximize-button')).toHaveAttribute(
      'aria-label', 
      'Maximize panel'
    );
    
    expect(screen.getByTestId('refresh-button')).toHaveAttribute(
      'aria-label', 
      'Refresh panel'
    );
    
    expect(screen.getByTestId('export-button')).toHaveAttribute(
      'aria-label', 
      'Export panel data'
    );
  });
}); 