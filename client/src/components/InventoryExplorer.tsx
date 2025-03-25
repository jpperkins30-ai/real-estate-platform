import React, { useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import InventoryTree, { NodeSelection } from './InventoryTree';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// Define response types
interface NationalStats {
  totalStates: number;
  totalCounties: number;
  totalProperties: number;
}

interface StateData {
  _id: string;
  id: string;
  name: string;
  abbreviation: string;
  metadata?: {
    totalCounties?: number;
    totalProperties?: number;
    statistics?: {
      totalTaxLiens?: number;
      totalValue?: number;
    }
  };
}

interface CountyData {
  _id: string;
  id: string;
  name: string;
  stateName: string;
  parentId: string;
  metadata?: {
    totalProperties?: number;
    statistics?: {
      totalTaxLiens?: number;
      averagePropertyValue?: number;
    }
  };
  searchConfig?: {
    enabled: boolean;
    lastRun?: string;
    nextScheduledRun?: string;
  };
}

interface PropertyData {
  _id: string;
  id: string;
  name: string;
  status: string;
  location?: {
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
    };
  };
  features?: {
    type?: string;
    condition?: string;
    yearBuilt?: number;
    squareFeet?: number;
    bedrooms?: number;
    bathrooms?: number;
  };
  taxStatus?: {
    assessedValue?: number;
    marketValue?: number;
    taxRate?: number;
    annualTaxAmount?: number;
    taxLienAmount?: number;
    taxLienStatus?: string;
    lastPaymentDate?: string;
  };
}

const InventoryExplorer: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<NodeSelection | null>(null);

  // Handle node selection in the tree
  const handleNodeSelect = (node: NodeSelection) => {
    setSelectedNode(node);
  };

  return (
    <Container fluid className="h-100">
      <Row className="h-100">
        <Col md={4} className="p-3 border-end" style={{ height: '100vh', overflowY: 'auto' }}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">Inventory Browser</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <InventoryTree onNodeSelect={handleNodeSelect} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={8} className="p-3">
          <DetailPanel selection={selectedNode} />
        </Col>
      </Row>
    </Container>
  );
};

interface DetailPanelProps {
  selection: NodeSelection | null;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ selection }) => {
  // If no selection, show welcome message
  if (!selection) {
    return (
      <Card className="h-100">
        <Card.Body className="d-flex flex-column align-items-center justify-content-center">
          <h4>Welcome to the Inventory Explorer</h4>
          <p className="text-muted">
            Select a state, county, or property from the tree view to see details.
          </p>
        </Card.Body>
      </Card>
    );
  }

  // Based on selection type, show appropriate detail component
  switch (selection.type) {
    case 'usmap':
      return <NationalDashboard />;
    case 'state':
      return <StateDetail stateId={selection.id} />;
    case 'county':
      return <CountyDetail countyId={selection.id} />;
    case 'property':
      return <PropertyDetail propertyId={selection.id} />;
    default:
      return <div>Unknown selection type</div>;
  }
};

// National dashboard component
const NationalDashboard: React.FC = () => {
  const { data, isLoading, error } = useQuery<NationalStats>({
    queryKey: ['nationalStats'],
    queryFn: async () => {
      const response = await axios.get('/api/stats/national');
      return response.data;
    }
  });

  if (isLoading) {
    return <Card className="h-100"><Card.Body>Loading national statistics...</Card.Body></Card>;
  }

  if (error) {
    return <Card className="h-100"><Card.Body>Error loading data: {(error as Error).message}</Card.Body></Card>;
  }

  return (
    <Card className="h-100">
      <Card.Header>
        <h5 className="mb-0">National Overview</h5>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={4}>
            <Card className="text-center mb-3">
              <Card.Body>
                <h2>{data?.totalStates || 0}</h2>
                <div className="text-muted">States</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center mb-3">
              <Card.Body>
                <h2>{data?.totalCounties || 0}</h2>
                <div className="text-muted">Counties</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center mb-3">
              <Card.Body>
                <h2>{data?.totalProperties || 0}</h2>
                <div className="text-muted">Properties</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

// State detail component
const StateDetail: React.FC<{ stateId: string }> = ({ stateId }) => {
  const { data, isLoading, error } = useQuery<StateData>({
    queryKey: ['state', stateId],
    queryFn: async () => {
      const response = await axios.get(`/api/states/${stateId}`);
      return response.data;
    }
  });

  if (isLoading) {
    return <Card className="h-100"><Card.Body>Loading state data...</Card.Body></Card>;
  }

  if (error) {
    return <Card className="h-100"><Card.Body>Error loading data: {(error as Error).message}</Card.Body></Card>;
  }

  return (
    <Card className="h-100">
      <Card.Header>
        <h5 className="mb-0">{data?.name} ({data?.abbreviation})</h5>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={6}>
            <Card className="mb-3">
              <Card.Body>
                <h6 className="mb-3">State Information</h6>
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <th>Counties</th>
                      <td>{data?.metadata?.totalCounties || 0}</td>
                    </tr>
                    <tr>
                      <th>Properties</th>
                      <td>{data?.metadata?.totalProperties || 0}</td>
                    </tr>
                    <tr>
                      <th>Active Tax Liens</th>
                      <td>{data?.metadata?.statistics?.totalTaxLiens || 0}</td>
                    </tr>
                    <tr>
                      <th>Total Property Value</th>
                      <td>${(data?.metadata?.statistics?.totalValue || 0).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="mb-3">
              <Card.Body>
                <h6 className="mb-3">Actions</h6>
                <div className="d-grid gap-2">
                  <button className="btn btn-primary">Export Properties</button>
                  <button className="btn btn-outline-secondary">View State Map</button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

// County detail component
const CountyDetail: React.FC<{ countyId: string }> = ({ countyId }) => {
  const { data, isLoading, error } = useQuery<CountyData>({
    queryKey: ['county', countyId],
    queryFn: async () => {
      const response = await axios.get(`/api/counties/${countyId}`);
      return response.data;
    }
  });

  if (isLoading) {
    return <Card className="h-100"><Card.Body>Loading county data...</Card.Body></Card>;
  }

  if (error) {
    return <Card className="h-100"><Card.Body>Error loading data: {(error as Error).message}</Card.Body></Card>;
  }

  return (
    <Card className="h-100">
      <Card.Header>
        <h5 className="mb-0">{data?.name} County</h5>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={6}>
            <Card className="mb-3">
              <Card.Body>
                <h6 className="mb-3">County Information</h6>
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <th>State</th>
                      <td>{data?.stateName}</td>
                    </tr>
                    <tr>
                      <th>Properties</th>
                      <td>{data?.metadata?.totalProperties || 0}</td>
                    </tr>
                    <tr>
                      <th>Active Tax Liens</th>
                      <td>{data?.metadata?.statistics?.totalTaxLiens || 0}</td>
                    </tr>
                    <tr>
                      <th>Average Property Value</th>
                      <td>${(data?.metadata?.statistics?.averagePropertyValue || 0).toLocaleString()}</td>
                    </tr>
                    <tr>
                      <th>Search Enabled</th>
                      <td>{data?.searchConfig?.enabled ? 'Yes' : 'No'}</td>
                    </tr>
                    <tr>
                      <th>Last Search Run</th>
                      <td>{data?.searchConfig?.lastRun ? new Date(data.searchConfig.lastRun).toLocaleDateString() : 'Never'}</td>
                    </tr>
                  </tbody>
                </table>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="mb-3">
              <Card.Body>
                <h6 className="mb-3">Actions</h6>
                <div className="d-grid gap-2">
                  <button className="btn btn-primary">Export Properties</button>
                  <button className="btn btn-outline-primary">Run County Search</button>
                  <button className="btn btn-outline-secondary">View County Map</button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

// Property detail component
const PropertyDetail: React.FC<{ propertyId: string }> = ({ propertyId }) => {
  const { data, isLoading, error } = useQuery<PropertyData>({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      const response = await axios.get(`/api/properties/${propertyId}`);
      return response.data;
    }
  });

  if (isLoading) {
    return <Card className="h-100"><Card.Body>Loading property data...</Card.Body></Card>;
  }

  if (error) {
    return <Card className="h-100"><Card.Body>Error loading data: {(error as Error).message}</Card.Body></Card>;
  }

  return (
    <Card className="h-100">
      <Card.Header>
        <h5 className="mb-0">{data?.name}</h5>
        <span className={`badge bg-${getStatusColor(data?.status)}`}>{data?.status}</span>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={6}>
            <Card className="mb-3">
              <Card.Body>
                <h6 className="mb-3">Property Details</h6>
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <th>Address</th>
                      <td>{data?.location?.address?.street}, {data?.location?.address?.city}, {data?.location?.address?.state} {data?.location?.address?.zipCode}</td>
                    </tr>
                    <tr>
                      <th>Type</th>
                      <td>{data?.features?.type}</td>
                    </tr>
                    <tr>
                      <th>Condition</th>
                      <td>{data?.features?.condition}</td>
                    </tr>
                    <tr>
                      <th>Year Built</th>
                      <td>{data?.features?.yearBuilt}</td>
                    </tr>
                    <tr>
                      <th>Square Feet</th>
                      <td>{data?.features?.squareFeet?.toLocaleString() || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>Bedrooms</th>
                      <td>{data?.features?.bedrooms || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>Bathrooms</th>
                      <td>{data?.features?.bathrooms || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="mb-3">
              <Card.Body>
                <h6 className="mb-3">Tax Information</h6>
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <th>Assessed Value</th>
                      <td>${data?.taxStatus?.assessedValue?.toLocaleString() || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>Market Value</th>
                      <td>${data?.taxStatus?.marketValue?.toLocaleString() || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>Tax Rate</th>
                      <td>{data?.taxStatus?.taxRate ? `${data.taxStatus.taxRate}%` : 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>Annual Tax</th>
                      <td>${data?.taxStatus?.annualTaxAmount?.toLocaleString() || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>Tax Lien Amount</th>
                      <td>${data?.taxStatus?.taxLienAmount?.toLocaleString() || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>Tax Lien Status</th>
                      <td>{data?.taxStatus?.taxLienStatus || 'None'}</td>
                    </tr>
                    <tr>
                      <th>Last Payment</th>
                      <td>{data?.taxStatus?.lastPaymentDate ? new Date(data.taxStatus.lastPaymentDate).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <Card>
              <Card.Body>
                <h6 className="mb-3">Actions</h6>
                <div className="d-flex gap-2">
                  <button className="btn btn-primary">Edit Property</button>
                  <button className="btn btn-outline-primary">Update Tax Status</button>
                  <button className="btn btn-outline-secondary">View Property Map</button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

// Helper function to get Bootstrap color class based on property status
const getStatusColor = (status?: string): string => {
  if (!status) return 'secondary';
  
  switch (status.toLowerCase()) {
    case 'active':
      return 'success';
    case 'pending':
      return 'warning';
    case 'sold':
      return 'info';
    case 'foreclosed':
      return 'danger';
    case 'tax lien':
      return 'purple';
    default:
      return 'secondary';
  }
};

export default InventoryExplorer; 