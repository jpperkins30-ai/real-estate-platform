import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Badge, Nav, Tab, Alert, Form } from 'react-bootstrap';
import { County } from '../../../types/inventory';
import MapComponent from '../../maps/MapComponent';
import { useInventoryContext } from '../../../context/InventoryContext';
import PropertySearchBox from '../PropertySearchBox';
import DataExportButton from '../../common/DataExportButton';
import SearchConfigEditor from '../county/SearchConfigEditor';
import { useCountyWithControllers } from '../../../services/inventoryService';
import { AttachedControllers } from '../controllers/AttachedControllers';
import LoadingSpinner from '../../common/LoadingSpinner';

// Mock data for development
const mockCounties: Record<string, County> = {
  'county-1': {
    id: 'county-1',
    name: 'Los Angeles County',
    type: 'county',
    parentId: 'state-1',
    stateId: 'state-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    geometry: {
      type: 'Polygon',
      coordinates: [],
    },
    metadata: {
      totalProperties: 450,
      statistics: {
        totalTaxLiens: 56,
        totalValue: 1200000,
        averagePropertyValue: 380000,
        totalPropertiesWithLiens: 56,
        lastUpdated: new Date(),
      },
      searchConfig: {
        searchUrl: 'https://assessor.lacounty.gov/search',
        lookupMethod: 'parcel_id',
        selectors: {
          parcelIdInput: '#parcelNumber',
          submitButton: '#searchButton',
          resultsTable: '.propertyTable',
        },
        lienUrl: 'https://ttc.lacounty.gov/property-tax-management-system',
      },
    },
    controllers: [
      {
        controllerId: 'controller-2',
        controllerType: 'Tax Sale',
        enabled: true,
        lastRun: new Date('2023-05-20'),
        nextScheduledRun: new Date('2023-08-20'),
        configuration: {
          url: 'https://ttc.lacounty.gov/property-tax-management-system',
          frequency: 'quarterly',
        },
      },
    ],
    properties: [
      {
        id: 'property-1',
        type: 'property',
        parentId: 'county-1',
        countyId: 'county-1',
        stateId: 'state-1',
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date('2023-06-20'),
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
          saleDate: new Date('2018-05-15'),
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
        address: {
          street: '123 Main St',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001',
        },
      },
      {
        id: 'property-2',
        type: 'property',
        parentId: 'county-1',
        countyId: 'county-1',
        stateId: 'state-1',
        createdAt: new Date('2023-02-10'),
        updatedAt: new Date('2023-06-25'),
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
          taxStatus: 'Current',
          assessedValue: 780000,
          marketValue: 850000,
          saleAmount: 720000,
          saleDate: new Date('2015-11-20'),
          taxAmount: 9600,
          taxYear: 2023,
          taxDueDate: new Date('2023-12-10'),
        },
        address: {
          street: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90002',
        },
      },
      {
        id: 'property-3',
        type: 'property',
        parentId: 'county-1',
        countyId: 'county-1',
        stateId: 'state-1',
        createdAt: new Date('2023-03-05'),
        updatedAt: new Date('2023-07-02'),
        geometry: {
          type: 'Point',
          coordinates: [-118.4085, 33.9416],
        },
        metadata: {
          propertyType: 'Residential',
          yearBuilt: 1992,
          landArea: 7200,
          landAreaUnit: 'sqft',
          buildingArea: 3100,
          buildingAreaUnit: 'sqft',
          taxStatus: 'Delinquent',
          assessedValue: 620000,
          marketValue: 680000,
          saleAmount: 590000,
          saleDate: new Date('2017-08-10'),
          taxAmount: 7400,
          taxYear: 2023,
          taxDueDate: new Date('2023-12-10'),
          liens: [
            {
              id: 'lien-3',
              amount: 11200,
              interestRate: 0.18,
              startDate: new Date('2023-02-10'),
              redemptionDeadline: new Date('2024-02-10'),
            },
          ],
        },
        address: {
          street: '789 Pine St',
          city: 'Manhattan Beach',
          state: 'CA',
          zipCode: '90266',
        },
      },
    ],
  },
  'county-2': {
    id: 'county-2',
    name: 'San Diego County',
    type: 'county',
    parentId: 'state-1',
    stateId: 'state-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    geometry: {
      type: 'Polygon',
      coordinates: [],
    },
    metadata: {
      totalProperties: 325,
      statistics: {
        totalTaxLiens: 38,
        totalValue: 950000,
        averagePropertyValue: 420000,
        totalPropertiesWithLiens: 38,
        lastUpdated: new Date(),
      },
      searchConfig: {
        searchUrl: 'https://sdttc.sandiegocounty.gov/search',
        lookupMethod: 'parcel_id',
        selectors: {},
      },
    },
    controllers: [],
    properties: [],
  },
  'county-3': {
    id: 'county-3',
    name: 'Harris County',
    type: 'county',
    parentId: 'state-2',
    stateId: 'state-2',
    createdAt: new Date(),
    updatedAt: new Date(),
    geometry: {
      type: 'Polygon',
      coordinates: [],
    },
    metadata: {
      totalProperties: 685,
      statistics: {
        totalTaxLiens: 74,
        totalValue: 1850000,
        averagePropertyValue: 310000,
        totalPropertiesWithLiens: 74,
        lastUpdated: new Date(),
      },
      searchConfig: {
        searchUrl: 'https://www.hctax.net/property/search',
        lookupMethod: 'account_number',
        selectors: {},
      },
    },
    controllers: [],
    properties: [],
  },
};

// Enhance mock data for visualization
mockCounties['county-1'].properties.forEach((property, index) => {
  // Add status based on tax status for visualization
  if (property.metadata.taxStatus === 'Delinquent') {
    // Make the first delinquent property a hot zone
    if (index === 0) {
      property.metadata.status = 'hot';
      property.metadata.lastUpdated = new Date('2023-07-08'); // 1 day ago
    } else {
      property.metadata.status = 'new';
      property.metadata.lastUpdated = new Date('2023-07-02'); // 7 days ago
    }
  } else {
    property.metadata.status = 'verified';
    property.metadata.lastUpdated = property.updatedAt;
  }

  // Enhance geometry for visualization
  if (property.geometry.type === 'Point') {
    property.geometry = {
      type: 'Feature',
      properties: {
        id: property.id,
        name: property.address.street,
        status: property.metadata.status,
        lastUpdated: property.metadata.lastUpdated,
        value: property.metadata.marketValue || 0
      },
      geometry: property.geometry
    };
  }
});

// Enhance county geometry with properties needed for visualization
mockCounties['county-1'].geometry = {
  type: 'Feature',
  properties: {
    id: mockCounties['county-1'].id,
    name: mockCounties['county-1'].name,
    status: 'verified',
    lastUpdated: mockCounties['county-1'].updatedAt,
    value: mockCounties['county-1'].metadata.statistics.totalValue || 0
  },
  geometry: mockCounties['county-1'].geometry
};

interface CountyDetailsProps {
  countyId: string;
}

const CountyDetails: React.FC<CountyDetailsProps> = ({ countyId }) => {
  const { selectNode } = useInventoryContext();
  const { data: county, isLoading, error } = useCountyWithControllers(countyId);
  const [activeTab, setActiveTab] = useState('overview');
  const [darkMode, setDarkMode] = useState<boolean>(false);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !county) {
    return <Alert variant="danger">Error loading county details. Please try again.</Alert>;
  }

  const handlePropertySelect = (propertyId: string) => {
    const property = county?.properties.find(p => p.id === propertyId);
    if (property) {
      selectNode({
        id: property.id,
        name: property.address?.street || `Property ${property.id}`,
        type: 'property',
        data: property
      });
    }
  };

  return (
    <div className="county-details">
      <Card className="mb-4">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h3>{county.name}</h3>
            <div>
              <Button variant="outline-primary" size="sm" className="me-2">Edit</Button>
              <DataExportButton data={county} filename={`county-${county.id}`} />
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <Tab.Container id="county-tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'overview')}>
            <Nav variant="tabs" className="mb-3">
              <Nav.Item>
                <Nav.Link eventKey="overview">Overview</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="properties">Properties</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="map">Map</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="search-config">Search Configuration</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="controllers">Controllers</Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              <Tab.Pane eventKey="overview">
                <Row>
                  <Col md={6}>
                    <Card>
                      <Card.Header>County Details</Card.Header>
                      <Card.Body>
                        <Table striped>
                          <tbody>
                            <tr>
                              <td>County Name</td>
                              <td>{county.name}</td>
                            </tr>
                            <tr>
                              <td>State</td>
                              <td>{county.stateId}</td>
                            </tr>
                            <tr>
                              <td>FIPS Code</td>
                              <td>{county.fips || 'N/A'}</td>
                            </tr>
                            <tr>
                              <td>Population</td>
                              <td>{county.population?.toLocaleString() || 'N/A'}</td>
                            </tr>
                            <tr>
                              <td>Area</td>
                              <td>{county.area ? `${county.area.toLocaleString()} sq mi` : 'N/A'}</td>
                            </tr>
                            <tr>
                              <td>Created</td>
                              <td>{new Date(county.createdAt).toLocaleDateString()}</td>
                            </tr>
                            <tr>
                              <td>Updated</td>
                              <td>{new Date(county.updatedAt).toLocaleDateString()}</td>
                            </tr>
                          </tbody>
                        </Table>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card>
                      <Card.Header>Statistics</Card.Header>
                      <Card.Body>
                        <Table striped>
                          <tbody>
                            <tr>
                              <td>Total Properties</td>
                              <td>{county.metadata?.totalProperties.toLocaleString() || 0}</td>
                            </tr>
                            <tr>
                              <td>Properties with Tax Liens</td>
                              <td>{county.metadata?.statistics.totalPropertiesWithLiens?.toLocaleString() || 0}</td>
                            </tr>
                            <tr>
                              <td>Total Tax Liens</td>
                              <td>{county.metadata?.statistics.totalTaxLiens.toLocaleString() || 0}</td>
                            </tr>
                            <tr>
                              <td>Total Property Value</td>
                              <td>${county.metadata?.statistics.totalValue.toLocaleString() || 0}</td>
                            </tr>
                            <tr>
                              <td>Average Property Value</td>
                              <td>${county.metadata?.statistics.averagePropertyValue?.toLocaleString() || 'N/A'}</td>
                            </tr>
                            <tr>
                              <td>Last Updated</td>
                              <td>{county.metadata?.statistics.lastUpdated ? new Date(county.metadata.statistics.lastUpdated).toLocaleDateString() : 'N/A'}</td>
                            </tr>
                          </tbody>
                        </Table>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab.Pane>

              <Tab.Pane eventKey="properties">
                <PropertySearchBox countyId={county.id} />
                <Card>
                  <Card.Body>
                    <div className="d-flex justify-content-between mb-3">
                      <Card.Title>Properties in {county.name}</Card.Title>
                      <div>
                        <Button variant="outline-secondary" size="sm" className="me-2">
                          <i className="bi bi-funnel me-1"></i>
                          Filter
                        </Button>
                        <Button variant="outline-secondary" size="sm">
                          <i className="bi bi-download me-1"></i>
                          Export
                        </Button>
                      </div>
                    </div>
                    
                    <div className="table-responsive">
                      <Table hover>
                        <thead>
                          <tr>
                            <th>Address</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Value</th>
                            <th>Last Updated</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {county.properties.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="text-center py-3">
                                No properties added yet. 
                                <Button variant="link" size="sm">Import properties</Button> or 
                                <Button variant="link" size="sm">Add manually</Button>
                              </td>
                            </tr>
                          ) : (
                            county.properties.map(property => (
                              <tr key={property.id}>
                                <td>{property.address.street}</td>
                                <td>{property.metadata.propertyType}</td>
                                <td>
                                  <Badge bg={
                                    property.metadata.status === 'new' ? 'warning' :
                                    property.metadata.status === 'hot' ? 'danger' :
                                    property.metadata.status === 'verified' ? 'primary' :
                                    property.metadata.taxStatus === 'Delinquent' ? 'danger' : 'success'
                                  }>
                                    {property.metadata.status ? 
                                      property.metadata.status.charAt(0).toUpperCase() + property.metadata.status.slice(1) :
                                      property.metadata.taxStatus}
                                  </Badge>
                                </td>
                                <td>${property.metadata.marketValue?.toLocaleString()}</td>
                                <td>{(property.metadata.lastUpdated || property.updatedAt).toLocaleDateString()}</td>
                                <td>
                                  <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    onClick={() => handlePropertySelect(property.id)}>
                                    View
                                  </Button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              <Tab.Pane eventKey="map">
                <div style={{ height: '500px', width: '100%' }}>
                  {county.geometry ? (
                    <MapComponent 
                      geometry={county.geometry}
                      zoom={8}
                      properties={{
                        name: county.name,
                        type: 'county'
                      }}
                    />
                  ) : (
                    <Alert variant="info">No geometry data available for this county.</Alert>
                  )}
                </div>
              </Tab.Pane>

              <Tab.Pane eventKey="search-config">
                <SearchConfigEditor county={county} />
              </Tab.Pane>

              <Tab.Pane eventKey="controllers">
                <AttachedControllers 
                  objectType="county" 
                  objectId={county.id} 
                  controllers={county.controllers || []} 
                />
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CountyDetails; 