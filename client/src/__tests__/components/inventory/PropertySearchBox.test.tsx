import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import PropertySearchBox from '../../../components/inventory/PropertySearchBox';
import propertySearchService from '../../../services/propertySearch';

// Mock the propertySearch service
vi.mock('../../../services/propertySearch', () => ({
  default: {
    searchProperty: vi.fn().mockImplementation(() => Promise.resolve(null))
  }
}));

// Mock navigate function
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('PropertySearchBox', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <PropertySearchBox countyId="county-123" />
      </BrowserRouter>
    );
  };

  it('renders correctly', () => {
    renderComponent();
    
    expect(screen.getByPlaceholderText(/Enter property ID, parcel number, or tax account number/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument();
    expect(screen.getByText(/system will try to find an exact match first, then fall back to fuzzy matching/i)).toBeInTheDocument();
  });

  it('handles form submission with valid input', async () => {
    const mockProperty = { id: 'property-123', name: 'Test Property' };
    propertySearchService.searchProperty.mockResolvedValueOnce(mockProperty);
    
    renderComponent();
    
    const input = screen.getByPlaceholderText(/Enter property ID, parcel number, or tax account number/i);
    const searchButton = screen.getByRole('button', { name: /Search/i });
    
    fireEvent.change(input, { target: { value: 'ABC123' } });
    fireEvent.click(searchButton);
    
    // Should show loading state
    expect(searchButton).toBeDisabled();
    expect(screen.getByText(/Searching.../i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(propertySearchService.searchProperty).toHaveBeenCalledWith('ABC123', 'county-123');
      expect(mockNavigate).toHaveBeenCalledWith(`/inventory/property/property-123`);
    });
  });

  it('displays error when no property is found', async () => {
    propertySearchService.searchProperty.mockResolvedValueOnce(null);
    
    renderComponent();
    
    const input = screen.getByPlaceholderText(/Enter property ID, parcel number, or tax account number/i);
    const searchButton = screen.getByRole('button', { name: /Search/i });
    
    fireEvent.change(input, { target: { value: 'INVALID123' } });
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(screen.getByText(/No property found matching/i)).toBeInTheDocument();
      expect(searchButton).not.toBeDisabled();
    });
  });

  it('displays error when search service throws error', async () => {
    propertySearchService.searchProperty.mockRejectedValueOnce(new Error('Network error'));
    
    renderComponent();
    
    const input = screen.getByPlaceholderText(/Enter property ID, parcel number, or tax account number/i);
    const searchButton = screen.getByRole('button', { name: /Search/i });
    
    fireEvent.change(input, { target: { value: 'ABC123' } });
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      expect(searchButton).not.toBeDisabled();
    });
  });

  it('validates input field is not empty', () => {
    renderComponent();
    
    const searchButton = screen.getByRole('button', { name: /Search/i });
    
    fireEvent.click(searchButton);
    
    expect(screen.getByText(/Please enter a property identifier/i)).toBeInTheDocument();
    expect(propertySearchService.searchProperty).not.toHaveBeenCalled();
  });
}); 