import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ControllerWizardLauncher } from '../../controllers/ControllerWizardLauncher';
import { renderWithRouter, mockNavigate } from '../../../../test/test-utils';
import { fetchControllerStatus } from '../../../../services/controllerService';
import { ControllerStatus } from '../../../types/controller.types';

// Mock the controller service
vi.mock('../../../../services/controllerService', () => ({
  fetchControllerStatus: vi.fn()
}));

const defaultProps = {
  entityType: 'state' as const,
  entityId: 'CA'
};

describe('ControllerWizardLauncher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    renderWithRouter(<ControllerWizardLauncher {...defaultProps} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays controller status when loaded', async () => {
    (fetchControllerStatus as jest.Mock).mockResolvedValueOnce({
      exists: true,
      status: 'running'
    });

    renderWithRouter(<ControllerWizardLauncher {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Controller Status: running')).toBeInTheDocument();
    });
  });

  it('shows error message when fetch fails', async () => {
    const error = new Error('Failed to fetch');
    (fetchControllerStatus as jest.Mock).mockRejectedValueOnce(error);

    renderWithRouter(<ControllerWizardLauncher {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to fetch')).toBeInTheDocument();
    });
  });

  it('navigates to wizard when launch button is clicked', async () => {
    (fetchControllerStatus as jest.Mock).mockResolvedValueOnce({
      exists: false,
      status: 'not_found'
    });

    renderWithRouter(<ControllerWizardLauncher {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Launch Wizard')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Launch Wizard'));

    expect(mockNavigate).toHaveBeenCalledWith('/wizard');
  });

  it('navigates to controller when it exists', async () => {
    (fetchControllerStatus as jest.Mock).mockResolvedValueOnce({
      exists: true,
      status: 'running'
    });

    renderWithRouter(<ControllerWizardLauncher {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Go to Controller')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Go to Controller'));

    expect(mockNavigate).toHaveBeenCalledWith('/controller');
  });
}); 