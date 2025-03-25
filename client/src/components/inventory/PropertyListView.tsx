import React, { useState, useEffect } from 'react';
import { Table, Spinner, Alert } from 'react-bootstrap';
import { PropertyObject } from '../../types/inventory';

// Mock data for development purposes
const mockProperties: Record<string, PropertyObject[]> = {
  'county-1': [
    {
      id: 'property-1',
      address: {
        street: '123 Main St',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
      },
      type: 'property',
      parentId: 'county-1',
      countyId: 'county-1',
      stateId: 'state-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      geometry: {
        type: 'Point',
        coordinates: [-118.2437, 34.0522],
      },
      metadata: {
        propertyType: 'Residential',
        yearBuilt: 1985,
        landArea: 5500,
        landAreaUnit: 'sqft',
        buildingArea: 2200,
        buildingAreaUnit: 'sqft',
        taxStatus: 'Delinquent',
        assessedValue: 450000,
        marketValue: 520000,
        saleAmount: 410000,
        lastSaleDate: new Date('2018-05-15'),
        taxAmount: 5200,
        taxYear: 2023,
        taxDueDate: new Date('2023-12-10'),
        liens: [
          {
            id: 'lien-1',
            amount: 8500,
            interestRate: 0.18,
            startDate: new Date('2023-01-15'),
            redemptionDeadline: new Date('2024-01-15'),
          },
        ],
      },
      controllers: [],
    },
    {
      id: 'property-2',
      address: {
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90002',
      },
      type: 'property',
      parentId: 'county-1',
      countyId: 'county-1',
      stateId: 'state-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      geometry: {
        type: 'Point',
        coordinates: [-118.3125, 34.0668],
      },
      metadata: {
        propertyType: 'Commercial',
        yearBuilt: 1978,
        landArea: 12000,
        landAreaUnit: 'sqft',
        buildingArea: 8500,
        buildingAreaUnit: 'sqft',
        taxStatus: 'Delinquent',
        assessedValue: 780000,
        marketValue: 850000,
        saleAmount: 720000,
        lastSaleDate: new Date('2015-11-20'),
        taxAmount: 9600,
        taxYear: 2023,
        taxDueDate: new Date('2023-12-10'),
        liens: [
          {
            id: 'lien-2',
            amount: 15800,
            interestRate: 0.18,
            startDate: new Date('2022-06-15'),
            redemptionDeadline: new Date('2023-06-15'),
          },
        ],
      },
      controllers: [],
    },
  ],
  'county-2': [
    {
      id: 'property-3',
      address: {
        street: '789 Beach Blvd',
        city: 'San Diego',
        state: 'CA',
        zipCode: '92101',
      },
      type: 'property',
      parentId: 'county-2',
      countyId: 'county-2',
      stateId: 'state-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      geometry: {
        type: 'Point',
        coordinates: [-117.1611, 32.7157],
      },
      metadata: {
        propertyType: 'Residential',
        yearBuilt: 2005,
        landArea: 4200,
        landAreaUnit: 'sqft',
        buildingArea: 3100,
        buildingAreaUnit: 'sqft',
        taxStatus: 'Delinquent',
        assessedValue: 680000,
        marketValue: 720000,
        saleAmount: 650000,
        lastSaleDate: new Date('2019-08-10'),
        taxAmount: 7500,
        taxYear: 2023,
        taxDueDate: new Date('2023-12-10'),
        liens: [
          {
            id: 'lien-3',
            amount: 12400,
            interestRate: 0.18,
            startDate: new Date('2023-02-20'),
            redemptionDeadline: new Date('2024-02-20'),
          },
        ],
      },
      controllers: [],
    },
  ],
  'county-3': [
    {
      id: 'property-4',
      address: {
        street: '101 Texas Ave',
        city: 'Houston',
        state: 'TX',
        zipCode: '77002',
      },
      type: 'property',
      parentId: 'county-3',
      countyId: 'county-3',
      stateId: 'state-2',
      createdAt: new Date(),
      updatedAt: new Date(),
      geometry: {
        type: 'Point',
        coordinates: [-95.3698, 29.7604],
      },
      metadata: {
        propertyType: 'Commercial',
        yearBuilt: 1995,
        landArea: 15000,
        landAreaUnit: 'sqft',
        buildingArea: 11000,
        buildingAreaUnit: 'sqft',
        taxStatus: 'Delinquent',
        assessedValue: 920000,
        marketValue: 980000,
        saleAmount: 880000,
        lastSaleDate: new Date('2017-03-25'),
        taxAmount: 11000,
        taxYear: 2023,
        taxDueDate: new Date('2023-12-10'),
        liens: [
          {
            id: 'lien-4',
            amount: 18600,
            interestRate: 0.18,
            startDate: new Date('2022-11-10'),
            redemptionDeadline: new Date('2023-11-10'),
          },
        ],
      },
      controllers: [],
    },
  ],
};

interface PropertyListViewProps {
  countyId: string;
}

const PropertyListView: React.FC<PropertyListViewProps> = ({ countyId }) => {
  const [properties, setProperties] = useState<PropertyObject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulating API fetch with setTimeout
    setLoading(true);
    setError(null);
    
    setTimeout(() => {
      try {
        // In a real implementation, this would fetch from an API
        const countyProperties = mockProperties[countyId] || [];
        setProperties(countyProperties);
        setLoading(false);
      } catch (err) {
        setError('Failed to load properties');
        setLoading(false);
      }
    }, 800);
  }, [countyId]);

  if (loading) {
    return (
      <div className="text-center p-3">
        <Spinner animation="border" size="sm" /> Loading properties...
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (properties.length === 0) {
    return <div className="text-muted p-2">No properties found in this county.</div>;
  }

  return (
    <div className="property-list-view">
      <Table size="sm" hover className="mt-2">
        <thead>
          <tr>
            <th>Address</th>
            <th>Type</th>
            <th>Tax Status</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {properties.map(property => (
            <tr key={property.id}>
              <td>{property.address.street}</td>
              <td>{property.metadata.propertyType}</td>
              <td>
                <span className={`badge ${property.metadata.taxStatus === 'Delinquent' ? 'bg-danger' : 'bg-success'}`}>
                  {property.metadata.taxStatus}
                </span>
              </td>
              <td>${property.metadata.marketValue?.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default PropertyListView; 