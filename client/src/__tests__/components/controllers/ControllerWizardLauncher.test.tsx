import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { ControllerWizardLauncher } from '../../../components/multiframe/controllers/ControllerWizardLauncher';
import { fetchControllerStatus } from '../../../services/controllerService';

// Mock dependencies
vi.mock('../../../services/controllerService', () => ({
  fetchControllerStatus: vi.fn()
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  MemoryRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

describe('ControllerWizardLauncher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with loading state initially', () => {
    vi.mocked(fetchControllerStatus).mockResolvedValue({
      data: {
        hasController: false,
        status: null,
        lastRun: null
      }
    });
    
    render(
      <MemoryRouter>
        <ControllerWizardLauncher 
          entityType="state"
          entityId="CA"
        />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows correct status for existing controller', async () => {
    vi.mocked(fetchControllerStatus).mockResolvedValue({
      data: {
        hasController: true,
        status: 'active',
        lastRun: '2023-01-01T12:00:00Z'
      }
    });
    
    render(
      <MemoryRouter>
        <ControllerWizardLauncher 
          entityType="county"
          entityId="los-angeles"
        />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('active')).toBeInTheDocument();
      expect(screen.getByText('Edit Controller')).toBeInTheDocument();
    });
  });

  it('shows create button when no controller exists', async () => {
    vi.mocked(fetchControllerStatus).mockResolvedValue({
      data: {
        hasController: false,
        status: null,
        lastRun: null
      }
    });
    
    render(
      <MemoryRouter>
        <ControllerWizardLauncher 
          entityType="state"
          entityId="CA"
        />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Create Controller')).toBeInTheDocument();
    });
  });

  it('handles error state correctly', async () => {
    vi.mocked(fetchControllerStatus).mockRejectedValue(new Error('Failed to fetch'));
    
    render(
      <MemoryRouter>
        <ControllerWizardLauncher 
          entityType="state"
          entityId="CA"
        />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Error loading controller status')).toBeInTheDocument();
    });
  });

  it('navigates to wizard when create/edit button is clicked', async () => {
    mockNavigate.mockClear();
    
    vi.mocked(fetchControllerStatus).mockResolvedValue({
      data: {
        hasController: true,
        status: 'active',
        lastRun: '2023-01-01T12:00:00Z'
      }
    });
    
    render(
      <MemoryRouter>
        <ControllerWizardLauncher 
          entityType="county"
          entityId="los-angeles"
        />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Edit Controller')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Edit Controller'));
    
    expect(mockNavigate).toHaveBeenCalledWith('/controller-wizard', {
      state: {
        entityType: 'county',
        entityId: 'los-angeles',
        step: 'EditController'
      }
    });
  });
}); 