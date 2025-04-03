import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ControllerWizardLauncher } from '../ControllerWizardLauncher';
import { fetchControllerStatus } from '../../../../services/controllerService';
import { createControllerStatusMock } from '../../../../test/test-utils';

// Mock with exact expected structure
vi.mock('../../../../services/controllerService', () => ({
  fetchControllerStatus: vi.fn()
}));

// More complete React Router mock
vi.mock('react-router-dom', () => {
  const actualReactRouter = vi.importActual('react-router-dom');
  return {
    ...actualReactRouter,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/', search: '', hash: '', state: {} })
  };
});

// Wrap tests in router context if needed
const renderWithRouter = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter>
      {ui}
    </MemoryRouter>
  );
};

describe('ControllerWizardLauncher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', async () => {
    // Delay the mock response to ensure loading state is visible
    vi.mocked(fetchControllerStatus).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        data: createControllerStatusMock()
      }), 100))
    );

    renderWithRouter(
      <ControllerWizardLauncher 
        entityType="state"
        entityId="CA"
      />
    );

    // Verify loading state appears
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  it('shows controller status when available', async () => {
    vi.mocked(fetchControllerStatus).mockResolvedValue({
      data: createControllerStatusMock({
        hasController: true,
        status: 'active',
        lastRun: '2023-01-01T12:00:00Z'
      })
    });
    
    console.log('Test: shows controller status when available');
    console.log('Mock value:', JSON.stringify(createControllerStatusMock({
      hasController: true,
      status: 'active',
      lastRun: '2023-01-01T12:00:00Z'
    })));
    
    renderWithRouter(
      <ControllerWizardLauncher 
        entityType="state"
        entityId="CA"
      />
    );
    
    // Wait for loading to finish
    try {
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      }, { timeout: 3000 });
    } catch (error) {
      console.error('Error waiting for loading to finish:');
      screen.debug();
      throw error;
    }
    
    // Check for visible status
    try {
      expect(screen.getByText('active')).toBeInTheDocument();
    } catch (error) {
      console.error('Error finding active status:');
      console.error('Current DOM:');
      screen.debug();
      console.error('All text content:');
      console.error(screen.getAllByText(/./).map(el => el.textContent));
      throw error;
    }
  });

  it('shows correct button text when no controller exists', async () => {
    vi.mocked(fetchControllerStatus).mockResolvedValue({
      data: createControllerStatusMock({
        hasController: false
      })
    });
    
    renderWithRouter(
      <ControllerWizardLauncher 
        entityType="state"
        entityId="CA"
      />
    );
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Check button text
    expect(screen.getByRole('button')).toHaveTextContent('Create Controller');
  });

  it('shows default state on error', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(fetchControllerStatus).mockRejectedValue(new Error('API Error'));
    
    renderWithRouter(
      <ControllerWizardLauncher 
        entityType="state"
        entityId="CA"
      />
    );
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Check that error was logged
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    // Check button has default text
    expect(screen.getByRole('button')).toHaveTextContent('Create Controller');
    
    consoleErrorSpy.mockRestore();
  });

  it('triggers navigation when button is clicked', async () => {
    const navigateMock = vi.fn();
    vi.mocked(require('react-router-dom').useNavigate).mockReturnValue(navigateMock);
    
    vi.mocked(fetchControllerStatus).mockResolvedValue({
      data: createControllerStatusMock({
        hasController: true,
        status: 'active'
      })
    });
    
    renderWithRouter(
      <ControllerWizardLauncher 
        entityType="state"
        entityId="CA"
      />
    );
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Click the button
    fireEvent.click(screen.getByRole('button'));
    
    // Verify navigation was triggered
    expect(navigateMock).toHaveBeenCalled();
  });
}); 