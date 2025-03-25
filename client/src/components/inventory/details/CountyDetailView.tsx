import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Row, Col, Card, Badge, Table, Spinner, Alert, Tabs, Tab, Button, Modal, ListGroup, Form, Pagination 
} from 'react-bootstrap';
import { FaCity, FaHome, FaEdit, FaTrash, FaDownload, FaSync, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

interface CountyDetail {
  _id: string;
  id: string;
  name: string;
  type: string;
  parentId: string;
  createdAt: string;
  updatedAt: string;
  geometry: {
    type: string;
    coordinates: number[][][];
  };
  metadata: {
    totalProperties: number;
    statistics: {
      totalTaxLiens: number;
      totalValue: number;
      averagePropertyValue: number;
      totalPropertiesWithLiens: number;
      lastUpdated: string;
    };
    searchConfig?: {
      lookupMethod: 'account_number' | 'parcel_id';
      searchUrl: string;
      lienUrl?: string;
      selectors: {
        ownerName: string;
        propertyAddress: string;
        marketValue: string;
        taxStatus: string;
        [key: string]: string;
      }
    }
  };
  controllers: {
    controllerId: string;
    controllerType: string;
    enabled: boolean;
    lastRun?: string;
    nextScheduledRun?: string;
    configuration: any;
  }[];
}

interface Property {
  _id: string;
  id: string;
  name: string;
  status: string;
  location: {
    address: {
      street: string;
      city: string;
      zipCode: string;
    };
  };
  taxStatus: {
    assessedValue: number;
    taxLienStatus?: string;
  };
}

interface State {
  _id: string;
  name: string;
  abbreviation: string;
}

interface CountyObject {
  _id: string;
  name: string;
  stateId: {
    _id: string;
    name: string;
    abbreviation: string;
  };
  createdAt: string;
  updatedAt: string;
  geometry: any; // GeoJSON geometry
  metadata: {
    totalProperties: number;
    statistics: {
      totalTaxLiens: number;
      totalValue: number;
      averagePropertyValue: number;
    },
    searchConfig?: {
      lookupMethod: 'account_number' | 'parcel_id';
      searchUrl: string;
      lienUrl?: string;
      selectors: {
        ownerName: string;
        propertyAddress: string;
        marketValue: string;
        taxStatus: string;
        [key: string]: string;
      }
    }
  };
  controllers: ControllerReference[];
}

interface PropertyObject {
  _id: string;
  parcelId: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  value: number;
  taxStatus: string;
  createdAt: string;
  updatedAt: string;
}

interface ControllerReference {
  controllerId: string | {
    _id: string;
    name: string;
  };
  controllerType: string;
  enabled: boolean;
  lastRun?: string;
  nextScheduledRun?: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PropertiesResponse {
  properties: PropertyObject[];
  pagination: PaginationInfo;
}

interface CountyDetailViewProps {
  countyId: string;
}

interface CountyEditFormProps {
  county: CountyObject;
  onSubmit: (data: Partial<CountyObject>) => void;
  onCancel: () => void;
}

interface SearchConfigModalProps {
  open: boolean;
  onClose: () => void;
  searchConfig?: CountyObject['metadata']['searchConfig'];
  onSubmit: (data: CountyObject['metadata']['searchConfig']) => void;
}

interface PropertyListTableProps {
  properties: PropertyObject[];
  onRowClick: (propertyId: string) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  activeKey: string;
  eventKey: string;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, activeKey, eventKey }) => {
  return (
    <div
      className={`tab-pane ${activeKey === eventKey ? 'active' : 'fade'}`}
      role="tabpanel"
      id={`county-tabpanel-${eventKey}`}
      aria-labelledby={`county-tab-${eventKey}`}
    >
      {activeKey === eventKey && <div className="p-3">{children}</div>}
    </div>
  );
};

const useCountyData = (countyId: string) => {
  return useQuery<CountyObject>({
    queryKey: ['county', countyId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/counties/${countyId}`);
      return data;
    }
  });
};

const useProperties = (countyId: string, filters = {}, page = 1, limit = 10) => {
  return useQuery<PropertiesResponse>({
    queryKey: ['properties', countyId, filters, page, limit],
    queryFn: async () => {
      const { data } = await axios.get(`/api/counties/${countyId}/properties`, {
        params: {
          ...filters,
          page,
          limit
        }
      });
      return data;
    },
    enabled: !!countyId
  });
};

const PropertyListTable: React.FC<PropertyListTableProps> = ({ properties, onRowClick }) => {
  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Parcel ID</th>
          <th>Address</th>
          <th>City</th>
          <th>Value</th>
          <th>Tax Status</th>
        </tr>
      </thead>
      <tbody>
        {properties.map(property => (
          <tr 
            key={property._id} 
            onClick={() => onRowClick(property._id)}
            style={{ cursor: 'pointer' }}
          >
            <td>{property.parcelId}</td>
            <td>{property.address}</td>
            <td>{property.city}</td>
            <td>${property.value?.toLocaleString() || 'N/A'}</td>
            <td>{property.taxStatus || 'Unknown'}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

const CountyEditForm: React.FC<CountyEditFormProps> = ({ county, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: county.name
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>County Name</Form.Label>
        <Form.Control 
          type="text" 
          name="name" 
          value={formData.name} 
          onChange={handleChange}
          required
        />
      </Form.Group>
      
      <div className="d-flex gap-2">
        <Button variant="primary" type="submit">
          Save Changes
        </Button>
        <Button variant="outline-secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Form>
  );
};

const SearchConfigModal: React.FC<SearchConfigModalProps> = ({ open, onClose, searchConfig, onSubmit }) => {
  const defaultSelectors = {
    ownerName: '',
    propertyAddress: '',
    marketValue: '',
    taxStatus: ''
  };

  const [formData, setFormData] = useState({
    lookupMethod: searchConfig?.lookupMethod || 'account_number',
    searchUrl: searchConfig?.searchUrl || '',
    lienUrl: searchConfig?.lienUrl || '',
    selectors: searchConfig?.selectors || defaultSelectors
  });

  const handleChange = (e: React.ChangeEvent<HTMLElement>) => {
    const { name, value } = e.target as HTMLInputElement | HTMLSelectElement;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      selectors: {
        ...prev.selectors,
        [name]: value
      }
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData as CountyObject['metadata']['searchConfig']);
  };

  return (
    <Modal show={open} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Search Configuration</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row className="mb-3">
            <Col xs={12}>
              <Form.Group>
                <Form.Label>Lookup Method</Form.Label>
                <Form.Select
                  name="lookupMethod"
                  value={formData.lookupMethod}
                  onChange={handleChange}
                >
                  <option value="account_number">Account Number</option>
                  <option value="parcel_id">Parcel ID</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col xs={12}>
              <Form.Group>
                <Form.Label>Search URL</Form.Label>
                <Form.Control
                  type="text"
                  name="searchUrl"
                  value={formData.searchUrl}
                  onChange={handleChange}
                  placeholder="URL for property search"
                />
                <Form.Text className="text-muted">
                  URL for property search
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col xs={12}>
              <Form.Group>
                <Form.Label>Lien URL (Optional)</Form.Label>
                <Form.Control
                  type="text"
                  name="lienUrl"
                  value={formData.lienUrl}
                  onChange={handleChange}
                  placeholder="URL for lien status checks (if available)"
                />
                <Form.Text className="text-muted">
                  URL for lien status checks (if available)
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          <h5 className="mt-4 mb-3">Selectors</h5>
          <Row className="mb-3">
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>Owner Name Selector</Form.Label>
                <Form.Control
                  type="text"
                  name="ownerName"
                  value={formData.selectors.ownerName}
                  onChange={handleSelectorChange}
                  placeholder="CSS selector for owner name"
                />
                <Form.Text className="text-muted">
                  CSS selector for owner name
                </Form.Text>
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>Property Address Selector</Form.Label>
                <Form.Control
                  type="text"
                  name="propertyAddress"
                  value={formData.selectors.propertyAddress}
                  onChange={handleSelectorChange}
                  placeholder="CSS selector for property address"
                />
                <Form.Text className="text-muted">
                  CSS selector for property address
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>Market Value Selector</Form.Label>
                <Form.Control
                  type="text"
                  name="marketValue"
                  value={formData.selectors.marketValue}
                  onChange={handleSelectorChange}
                  placeholder="CSS selector for market value"
                />
                <Form.Text className="text-muted">
                  CSS selector for market value
                </Form.Text>
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>Tax Status Selector</Form.Label>
                <Form.Control
                  type="text"
                  name="taxStatus"
                  value={formData.selectors.taxStatus}
                  onChange={handleSelectorChange}
                  placeholder="CSS selector for tax status"
                />
                <Form.Text className="text-muted">
                  CSS selector for tax status
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Save Configuration
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

interface CustomPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const items = [];
  
  items.push(
    <Pagination.Prev 
      key="prev" 
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
    />
  );
  
  if (currentPage > 3) {
    items.push(
      <Pagination.Item key={1} onClick={() => onPageChange(1)}>
        1
      </Pagination.Item>
    );
    
    if (currentPage > 4) {
      items.push(<Pagination.Ellipsis key="ellipsis1" />);
    }
  }
  
  for (let page = Math.max(1, currentPage - 1); page <= Math.min(totalPages, currentPage + 1); page++) {
    items.push(
      <Pagination.Item 
        key={page} 
        active={page === currentPage}
        onClick={() => onPageChange(page)}
      >
        {page}
      </Pagination.Item>
    );
  }
  
  if (currentPage < totalPages - 2) {
    if (currentPage < totalPages - 3) {
      items.push(<Pagination.Ellipsis key="ellipsis2" />);
    }
    
    items.push(
      <Pagination.Item 
        key={totalPages} 
        onClick={() => onPageChange(totalPages)}
      >
        {totalPages}
      </Pagination.Item>
    );
  }
  
  items.push(
    <Pagination.Next 
      key="next" 
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
    />
  );
  
  return <Pagination>{items}</Pagination>;
};

const CountyDetailView: React.FC<CountyDetailViewProps> = ({ countyId }) => {
  const { data: county, isLoading, error } = useCountyData(countyId);
  const { 
    data: propertiesData, 
    isLoading: propertiesLoading 
  } = useProperties(countyId, {}, 1, 10);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isSearchConfigModalOpen, setIsSearchConfigModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const handleTabChange = (key: string | null) => {
    if (key) {
      setActiveTab(key);
    }
  };
  
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };
  
  const updateCountyMutation = useMutation({
    mutationFn: async (countyData: Partial<CountyObject>) => {
      const { data } = await axios.put(`/api/counties/${countyId}`, countyData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['county', countyId] });
      setIsEditing(false);
    }
  });
  
  const handleUpdate = (formData: Partial<CountyObject>) => {
    updateCountyMutation.mutate(formData);
  };
  
  const updateSearchConfigMutation = useMutation({
    mutationFn: async (searchConfig: CountyObject['metadata']['searchConfig']) => {
      const { data } = await axios.put(`/api/counties/${countyId}/searchConfig`, searchConfig);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['county', countyId] });
      setIsSearchConfigModalOpen(false);
    }
  });
  
  const handleSearchConfigModalOpen = () => {
    setIsSearchConfigModalOpen(true);
  };
  
  const handleSearchConfigModalClose = () => {
    setIsSearchConfigModalOpen(false);
  };
  
  const handleSearchConfigUpdate = (configData: CountyObject['metadata']['searchConfig']) => {
    updateSearchConfigMutation.mutate(configData);
  };
  
  const handlePropertyRowClick = (propertyId: string) => {
    navigate(`/properties/${propertyId}`);
  };
  
  const handleAddProperty = () => {
    navigate(`/properties/create?countyId=${countyId}`);
  };
  
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="danger">
        Error loading county: {(error as Error).message}
      </Alert>
    );
  }
  
  if (!county) {
    return <Alert variant="warning">No county data found</Alert>;
  }
  
  return (
    <div className="county-detail-view">
      <Row className="g-3">
        <Col xs={12}>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="mb-0">
                    {county.name}, {county.stateId.abbreviation || 'State'}
                  </h4>
                  <div className="text-muted small">
                    Total Properties: {county.metadata?.totalProperties || 0}
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleSearchConfigModalOpen}
                  >
                    Search Configuration
                  </Button>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    onClick={handleEditToggle}
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              {isEditing ? (
                <CountyEditForm 
                  county={county} 
                  onSubmit={handleUpdate} 
                  onCancel={handleEditToggle} 
                />
              ) : (
                <>
                  <Tabs
                    activeKey={activeTab}
                    onSelect={handleTabChange}
                    className="mb-3"
                  >
                    <Tab eventKey="overview" title="Overview" />
                    <Tab eventKey="properties" title="Properties" />
                    <Tab eventKey="controllers" title="Controllers" />
                    <Tab eventKey="statistics" title="Statistics" />
                  </Tabs>
                  
                  <TabPanel activeKey={activeTab} eventKey="overview">
                    <Row className="g-3">
                      <Col xs={12} md={6}>
                        <h5>County Details</h5>
                        <p>State: {county.stateId.name || 'State'}</p>
                        <p>Created: {new Date(county.createdAt).toLocaleDateString()}</p>
                        <p>Last Updated: {new Date(county.updatedAt).toLocaleDateString()}</p>
                        
                        {county.metadata.searchConfig && (
                          <div className="mt-4">
                            <h5>Search Configuration</h5>
                            <p>Lookup Method: {county.metadata.searchConfig.lookupMethod}</p>
                            <p>Search URL: {county.metadata.searchConfig.searchUrl}</p>
                            {county.metadata.searchConfig.lienUrl && (
                              <p>Lien URL: {county.metadata.searchConfig.lienUrl}</p>
                            )}
                          </div>
                        )}
                      </Col>
                      <Col xs={12} md={6}>
                        <div style={{ height: '300px', width: '100%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {county.geometry ? (
                            <span>Map will be displayed here once libraries are installed</span>
                          ) : (
                            <span>No geographic data available</span>
                          )}
                        </div>
                      </Col>
                    </Row>
                  </TabPanel>
                  
                  <TabPanel activeKey={activeTab} eventKey="properties">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">Properties</h5>
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={handleAddProperty}
                      >
                        Add Property
                      </Button>
                    </div>
                    
                    {propertiesLoading ? (
                      <div className="text-center p-3">
                        <Spinner animation="border" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </Spinner>
                      </div>
                    ) : propertiesData?.properties && propertiesData.properties.length > 0 ? (
                      <>
                        <PropertyListTable 
                          properties={propertiesData.properties}
                          onRowClick={handlePropertyRowClick}
                        />
                        
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <div>
                            <Form.Select 
                              style={{ width: 'auto', display: 'inline-block' }}
                              value={limit}
                              onChange={(e) => {
                                setLimit(parseInt(e.target.value, 10));
                                setPage(1);
                              }}
                            >
                              <option value={5}>5 per page</option>
                              <option value={10}>10 per page</option>
                              <option value={25}>25 per page</option>
                              <option value={50}>50 per page</option>
                              <option value={100}>100 per page</option>
                            </Form.Select>
                            <span className="ms-2">
                              Total: {propertiesData.pagination?.total || 0} properties
                            </span>
                          </div>
                          
                          <CustomPagination
                            currentPage={page}
                            totalPages={propertiesData.pagination?.totalPages || 1}
                            onPageChange={setPage}
                          />
                        </div>
                      </>
                    ) : (
                      <Alert variant="info">No properties found for this county</Alert>
                    )}
                  </TabPanel>
                  
                  <TabPanel activeKey={activeTab} eventKey="controllers">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">Controllers</h5>
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => {
                          // Open controller selection modal
                        }}
                      >
                        Add Controller
                      </Button>
                    </div>
                    
                    {county.controllers && county.controllers.length > 0 ? (
                      <ListGroup>
                        {county.controllers.map((controller) => {
                          const controllerName = typeof controller.controllerId === 'object' 
                            ? controller.controllerId.name 
                            : 'Controller';
                            
                          return (
                            <ListGroup.Item 
                              key={typeof controller.controllerId === 'object' ? controller.controllerId._id : controller.controllerId} 
                              action
                              className="d-flex justify-content-between align-items-center"
                            >
                              <div>
                                <div className="fw-bold">{controllerName}</div>
                                <div className="text-muted small">
                                  Type: {controller.controllerType} | 
                                  Status: {controller.enabled ? 'Enabled' : 'Disabled'}
                                </div>
                              </div>
                              <div>
                                <Form.Check 
                                  type="switch"
                                  id={`controller-switch-${typeof controller.controllerId === 'object' ? controller.controllerId._id : controller.controllerId}`}
                                  label=""
                                  checked={controller.enabled}
                                  onChange={() => {
                                    // Toggle controller enabled status
                                  }}
                                />
                              </div>
                            </ListGroup.Item>
                          );
                        })}
                      </ListGroup>
                    ) : (
                      <Alert variant="info">No controllers attached to this county</Alert>
                    )}
                  </TabPanel>
                  
                  <TabPanel activeKey={activeTab} eventKey="statistics">
                    <h5>Statistics</h5>
                    <Row className="g-3 mt-2">
                      <Col xs={12} md={6}>
                        <Card className="bg-light h-100">
                          <Card.Body className="text-center">
                            <h6>Tax Liens</h6>
                            <h3>{county.metadata?.statistics?.totalTaxLiens || 0}</h3>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col xs={12} md={6}>
                        <Card className="bg-light h-100">
                          <Card.Body className="text-center">
                            <h6>Total Value</h6>
                            <h3>
                              ${(county.metadata?.statistics?.totalValue || 0).toLocaleString()}
                            </h3>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col xs={12} md={6}>
                        <Card className="bg-light h-100">
                          <Card.Body className="text-center">
                            <h6>Average Property Value</h6>
                            <h3>
                              ${(county.metadata?.statistics?.averagePropertyValue || 0).toLocaleString()}
                            </h3>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col xs={12} md={6}>
                        <Card className="bg-light h-100">
                          <Card.Body className="text-center">
                            <h6>Total Properties</h6>
                            <h3>{county.metadata?.totalProperties || 0}</h3>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </TabPanel>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <SearchConfigModal
        open={isSearchConfigModalOpen}
        onClose={handleSearchConfigModalClose}
        searchConfig={county.metadata.searchConfig}
        onSubmit={handleSearchConfigUpdate}
      />
    </div>
  );
};

export default CountyDetailView; 