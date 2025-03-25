import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Tabs, 
  Tab, 
  Spinner, 
  Alert, 
  ListGroup, 
  Form, 
  Modal
} from 'react-bootstrap';
// Import types for map (commented out until library is installed)
// import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Type definitions
interface StateObject {
  _id: string;
  name: string;
  abbreviation: string;
  createdAt: string;
  updatedAt: string;
  geometry: any; // GeoJSON geometry
  metadata: {
    totalCounties: number;
    totalProperties: number;
    statistics: {
      totalTaxLiens: number;
      totalValue: number;
      averagePropertyValue: number;
      lastUpdated: string;
    }
  };
  controllers: ControllerReference[];
}

interface CountyObject {
  _id: string;
  name: string;
  stateId: string;
  createdAt: string;
  updatedAt: string;
  geometry: any; // GeoJSON geometry
  metadata: {
    totalProperties: number;
    statistics: {
      totalTaxLiens: number;
      totalValue: number;
      averagePropertyValue: number;
    }
  };
}

interface ControllerReference {
  controllerId: string;
  controllerType: string;
  enabled: boolean;
  lastRun?: string;
  nextScheduledRun?: string;
}

// Props for the component
interface StateDetailViewProps {
  stateId: string;
}

// State edit form props
interface StateEditFormProps {
  state: StateObject;
  onSubmit: (data: Partial<StateObject>) => void;
  onCancel: () => void;
}

// Controller modal props
interface ControllerSelectionModalProps {
  open: boolean;
  onClose: () => void;
  stateId: string;
}

// Custom hooks for data fetching
const useStateData = (stateId: string) => {
  return useQuery<StateObject>({
    queryKey: ['state', stateId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/states/${stateId}`);
      return data;
    }
  });
};

const useCounties = (stateId: string) => {
  return useQuery<CountyObject[]>({
    queryKey: ['counties', stateId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/states/${stateId}/counties`);
      return data.counties;
    },
    enabled: !!stateId
  });
};

const useAddController = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ stateId, controllerId, controllerType }: { 
      stateId: string;
      controllerId: string;
      controllerType: string;
    }) => {
      const { data } = await axios.post(`/api/states/${stateId}/controllers`, {
        controllerId,
        controllerType
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['state', variables.stateId] });
    }
  });
};

// Tab panel component
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
      id={`state-tabpanel-${eventKey}`}
      aria-labelledby={`state-tab-${eventKey}`}
    >
      {activeKey === eventKey && <div className="p-3">{children}</div>}
    </div>
  );
};

// State Edit Form component
const StateEditForm: React.FC<StateEditFormProps> = ({ state, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: state.name,
    abbreviation: state.abbreviation
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
        <Form.Label>State Name</Form.Label>
        <Form.Control 
          type="text" 
          name="name" 
          value={formData.name} 
          onChange={handleChange}
          required
        />
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>Abbreviation</Form.Label>
        <Form.Control 
          type="text" 
          name="abbreviation" 
          value={formData.abbreviation} 
          onChange={handleChange} 
          maxLength={2}
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

// Controller Selection Modal
const ControllerSelectionModal: React.FC<ControllerSelectionModalProps> = ({ open, onClose, stateId }) => {
  const [selectedController, setSelectedController] = useState('');
  const [controllerType, setControllerType] = useState('data');
  
  const addControllerMutation = useAddController();
  
  const { data: controllers, isLoading: loadingControllers } = useQuery({
    queryKey: ['controllers'],
    queryFn: async () => {
      const { data } = await axios.get('/api/controllers');
      return data;
    }
  });
  
  const handleAddController = () => {
    if (selectedController) {
      addControllerMutation.mutate({
        stateId,
        controllerId: selectedController,
        controllerType
      }, {
        onSuccess: () => {
          onClose();
        }
      });
    }
  };
  
  return (
    <Modal show={open} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add Controller</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loadingControllers ? (
          <div className="text-center p-3">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : (
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Controller</Form.Label>
              <Form.Select 
                value={selectedController} 
                onChange={(e) => setSelectedController(e.target.value)}
              >
                <option value="">Select a controller</option>
                {controllers?.map((controller: any) => (
                  <option key={controller._id} value={controller._id}>
                    {controller.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Controller Type</Form.Label>
              <Form.Select 
                value={controllerType} 
                onChange={(e) => setControllerType(e.target.value)}
              >
                <option value="data">Data</option>
                <option value="search">Search</option>
                <option value="validation">Validation</option>
                <option value="notification">Notification</option>
              </Form.Select>
            </Form.Group>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleAddController} 
          disabled={!selectedController || addControllerMutation.isPending}
        >
          {addControllerMutation.isPending ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Adding...
            </>
          ) : (
            'Add Controller'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// Main Component
const StateDetailView: React.FC<StateDetailViewProps> = ({ stateId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isControllerModalOpen, setIsControllerModalOpen] = useState(false);
  
  const queryClient = useQueryClient();
  
  // Fetch state data
  const { data: state, isLoading, error } = useStateData(stateId);
  
  // Fetch counties for this state
  const { data: counties } = useCounties(stateId);
  
  // Mutation for updating state
  const updateStateMutation = useMutation({
    mutationFn: async (stateData: Partial<StateObject>) => {
      const { data } = await axios.put(`/api/states/${stateId}`, stateData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['state', stateId] });
      setIsEditing(false);
    }
  });
  
  // Handle tab change
  const handleTabChange = (key: string | null) => {
    if (key) {
      setActiveTab(key);
    }
  };
  
  // Handle edit mode toggle
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };
  
  // Handle state update
  const handleUpdate = (formData: Partial<StateObject>) => {
    updateStateMutation.mutate(formData);
  };
  
  // Handle controller modal
  const handleControllerModalOpen = () => {
    setIsControllerModalOpen(true);
  };
  
  const handleControllerModalClose = () => {
    setIsControllerModalOpen(false);
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
        Error loading state: {(error as Error).message}
      </Alert>
    );
  }
  
  if (!state) {
    return <Alert variant="warning">No state data found</Alert>;
  }
  
  return (
    <div className="state-detail-view">
      <Row className="g-3">
        <Col xs={12}>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="mb-0">
                    {state.name} ({state.abbreviation})
                  </h4>
                  <div className="text-muted small">
                    Total Counties: {state.metadata?.totalCounties || 0} | 
                    Total Properties: {state.metadata?.totalProperties || 0}
                  </div>
                </div>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  onClick={handleEditToggle}
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {isEditing ? (
                <StateEditForm 
                  state={state} 
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
                    <Tab eventKey="counties" title="Counties" />
                    <Tab eventKey="controllers" title="Controllers" />
                    <Tab eventKey="statistics" title="Statistics" />
                  </Tabs>
                  
                  {/* Overview Tab */}
                  <TabPanel activeKey={activeTab} eventKey="overview">
                    <Row className="g-3">
                      <Col xs={12} md={6}>
                        <h5>State Details</h5>
                        <p>Created: {new Date(state.createdAt).toLocaleDateString()}</p>
                        <p>Last Updated: {new Date(state.updatedAt).toLocaleDateString()}</p>
                      </Col>
                      <Col xs={12} md={6}>
                        <div style={{ height: '300px', width: '100%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {state.geometry ? (
                            <span>Map will be displayed here once libraries are installed</span>
                          ) : (
                            <span>No geographic data available</span>
                          )}
                          {/* Uncomment when react-leaflet is installed
                          <MapContainer 
                            center={[39.8283, -98.5795]} 
                            zoom={4} 
                            style={{ height: '100%', width: '100%' }}
                          >
                            <TileLayer
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <GeoJSON data={state.geometry} />
                          </MapContainer>
                          */}
                        </div>
                      </Col>
                    </Row>
                  </TabPanel>
                  
                  {/* Counties Tab */}
                  <TabPanel activeKey={activeTab} eventKey="counties">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">Counties</h5>
                      <Button variant="primary" size="sm">
                        Add County
                      </Button>
                    </div>
                    
                    {counties && counties.length > 0 ? (
                      <ListGroup>
                        {counties.map(county => (
                          <ListGroup.Item 
                            key={county._id} 
                            action
                            className="d-flex justify-content-between align-items-center"
                          >
                            <div>
                              <div className="fw-bold">{county.name}</div>
                              <div className="text-muted small">
                                Properties: {county.metadata?.totalProperties || 0}
                              </div>
                            </div>
                            <Button 
                              variant="outline-secondary" 
                              size="sm"
                              href={`/counties/${county._id}`}
                            >
                              View
                            </Button>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    ) : (
                      <Alert variant="info">No counties found for this state</Alert>
                    )}
                  </TabPanel>
                  
                  {/* Controllers Tab */}
                  <TabPanel activeKey={activeTab} eventKey="controllers">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">Controllers</h5>
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={handleControllerModalOpen}
                      >
                        Add Controller
                      </Button>
                    </div>
                    
                    {state.controllers && state.controllers.length > 0 ? (
                      <ListGroup>
                        {state.controllers.map((controller: ControllerReference) => (
                          <ListGroup.Item 
                            key={controller.controllerId} 
                            action
                            className="d-flex justify-content-between align-items-center"
                          >
                            <div>
                              <div className="fw-bold">
                                Controller ID: {controller.controllerId}
                              </div>
                              <div className="text-muted small">
                                Type: {controller.controllerType} | 
                                Status: {controller.enabled ? 'Enabled' : 'Disabled'}
                              </div>
                            </div>
                            <div>
                              <Form.Check 
                                type="switch"
                                id={`controller-switch-${controller.controllerId}`}
                                label=""
                                checked={controller.enabled}
                                onChange={() => {
                                  // Toggle controller enabled status
                                }}
                              />
                            </div>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    ) : (
                      <Alert variant="info">No controllers attached to this state</Alert>
                    )}
                  </TabPanel>
                  
                  {/* Statistics Tab */}
                  <TabPanel activeKey={activeTab} eventKey="statistics">
                    <h5>Statistics</h5>
                    <Row className="g-3 mt-2">
                      <Col xs={12} md={6}>
                        <Card className="bg-light h-100">
                          <Card.Body className="text-center">
                            <h6>Tax Liens</h6>
                            <h3>{state.metadata?.statistics?.totalTaxLiens || 0}</h3>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col xs={12} md={6}>
                        <Card className="bg-light h-100">
                          <Card.Body className="text-center">
                            <h6>Total Value</h6>
                            <h3>
                              ${(state.metadata?.statistics?.totalValue || 0).toLocaleString()}
                            </h3>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col xs={12} md={6}>
                        <Card className="bg-light h-100">
                          <Card.Body className="text-center">
                            <h6>Average Property Value</h6>
                            <h3>
                              ${(state.metadata?.statistics?.averagePropertyValue || 0).toLocaleString()}
                            </h3>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col xs={12} md={6}>
                        <Card className="bg-light h-100">
                          <Card.Body className="text-center">
                            <h6>Total Properties</h6>
                            <h3>{state.metadata?.totalProperties || 0}</h3>
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
      
      {/* Controller Modal */}
      <ControllerSelectionModal
        open={isControllerModalOpen}
        onClose={handleControllerModalClose}
        stateId={stateId}
      />
    </div>
  );
};

export default StateDetailView; 