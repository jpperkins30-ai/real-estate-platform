import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter, createControllerWizardProps } from '../../test-utils';
import { ControllerWizardLauncher } from 'src/components/multiframe/controllers/ControllerWizardLauncher';
import { fetchControllerStatus } from 'src/services/controllerService';

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Mock service
vi.mock('../../services/controllerService', () => ({
  fetchControllerStatus: vi.fn()
}));

describe('ControllerWizardLauncher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchControllerStatus).mockResolvedValue({ hasController: true });
  });

  it('renders launch button correctly', async () => {
    renderWithRouter(<ControllerWizardLauncher {...createControllerWizardProps()} />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText(/launch wizard/i)).toBeInTheDocument();
    });
  });

  it('navigates to wizard path when button is clicked', async () => {
    renderWithRouter(<ControllerWizardLauncher {...createControllerWizardProps()} />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText(/launch wizard/i)).toBeInTheDocument();
    });
    
    const launchButton = screen.getByText(/launch wizard/i);
    await userEvent.click(launchButton);
    
    expect(mockNavigate).toHaveBeenCalledWith(
      '/wizard/state/CA',
      { state: { entityType: 'state', entityId: 'CA', step: 2 } }
    );
  });
}); 


