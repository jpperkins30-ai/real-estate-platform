import React, { useState } from 'react';
import { 
  Card, 
  Button, 
  Form, 
  Table, 
  Badge, 
  Modal, 
  Alert, 
  Spinner,
  Tabs,
  Tab
} from 'react-bootstrap';
import { 
  useControllers, 
  useAttachController, 
  useDetachController, 
  useRunController 
} from '../../../services/inventoryService';
import { ControllerReference, Property, Controller } from '../../../types/inventory';
import { FaPlus, FaTrash, FaPlay, FaCog, FaBan, FaCheck } from 'react-icons/fa';

interface PropertyControllerProps {
  property: Property;
  onUpdate?: () => void;
}

const PropertyController: React.FC<PropertyControllerProps> = ({ property, onUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedController, setSelectedController] = useState<Controller | null>(null);
  const [configuration, setConfiguration] = useState<string>('{}');
  const [configError, setConfigError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('attached');

  // React Query hooks
  const { data: controllers, isLoading: loadingControllers } = useControllers();
  const attachController = useAttachController();
  const detachController = useDetachController();
  const runController = useRunController();

  // Filter out controllers that are already attached to this property
  const availableControllers = controllers?.filter(controller => 
    !property.controllers?.some(attached => attached.controllerId === controller.id)
  ) || [];

  // Get attached controllers
  const attachedControllers = property.controllers || [];

  const handleAttachController = async () => {
    if (!selectedController) return;
    
    let configObject = {};
    try {
      configObject = configuration.trim() ? JSON.parse(configuration) : {};
      setConfigError(null);
    } catch (error) {
      setConfigError('Invalid JSON configuration');
      return;
    }

    try {
      await attachController.mutateAsync({
        objectType: 'property',
        objectId: property.id,
        controllerId: selectedController.id,
        controllerType: selectedController.controllerType as any,
        configuration: configObject
      });

      setShowModal(false);
      setSelectedController(null);
      setConfiguration('{}');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error attaching controller:', error);
    }
  };

  const handleDetachController = async (controllerId: string) => {
    try {
      await detachController.mutateAsync({
        objectType: 'property',
        objectId: property.id,
        controllerId
      });
      
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error detaching controller:', error);
    }
  };

  const handleRunController = async (controllerId: string) => {
    try {
      await runController.mutateAsync({
        objectType: 'property',
        objectId: property.id,
        controllerId
      });
      
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error running controller:', error);
    }
  };

  const renderRequiredFields = () => {
    if (!selectedController?.configTemplate?.requiredFields.length) {
      return null;
    }

    try {
      const config = configuration ? JSON.parse(configuration) : {};
      
      return (
        <div className="mt-3">
          <h6>Required Fields</h6>
          <ul className="mb-3">
            {selectedController.configTemplate.requiredFields.map(field => (
              <li key={field} className="d-flex align-items-center">
                <span>{field}</span>
                {config[field] ? (
                  <Badge bg="success" className="ms-2">
                    <FaCheck className="me-1" /> Provided
                  </Badge>
                ) : (
                  <Badge bg="danger" className="ms-2">
                    <FaBan className="me-1" /> Missing
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        </div>
      );
    } catch (error) {
      return null;
    }
  };

  const handleControllerSelect = (controller: Controller) => {
    setSelectedController(controller);
    
    // Set default configuration based on template
    if (controller.configTemplate) {
      const defaultConfig: Record<string, any> = {};
      controller.configTemplate.requiredFields.forEach(field => {
        defaultConfig[field] = '';
      });
      setConfiguration(JSON.stringify(defaultConfig, null, 2));
    } else {
      setConfiguration('{}');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleString();
  };

  const renderAttachedControllers = () => {
    if (attachedControllers.length === 0) {
      return (
        <Alert variant="info">
          No controllers are attached to this property. Attach controllers to automate data collection and processing.
        </Alert>
      );
    }

    return (
      <Table striped bordered responsive>
        <thead>
          <tr>
            <th>Controller</th>
            <th>Type</th>
            <th>Status</th>
            <th>Last Run</th>
            <th>Next Run</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {attachedControllers.map((controller: ControllerReference) => (
            <tr key={controller.controllerId}>
              <td>{controllers?.find(c => c.id === controller.controllerId)?.name || 'Unknown'}</td>
              <td>{controller.controllerType}</td>
              <td>
                <Badge bg={controller.enabled ? 'success' : 'secondary'}>
                  {controller.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </td>
              <td>{formatDate(controller.lastRun)}</td>
              <td>{formatDate(controller.nextScheduledRun)}</td>
              <td>
                <div className="d-flex gap-2">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => handleRunController(controller.controllerId)}
                    disabled={runController.isLoading}
                  >
                    <FaPlay /> Run
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => handleDetachController(controller.controllerId)}
                    disabled={detachController.isLoading}
                  >
                    <FaTrash /> Remove
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  const renderAvailableControllers = () => {
    if (loadingControllers) {
      return (
        <div className="text-center py-4">
          <Spinner animation="border" />
          <p className="mt-2">Loading available controllers...</p>
        </div>
      );
    }

    if (availableControllers.length === 0) {
      return (
        <Alert variant="info">
          All available controllers have been attached to this property.
        </Alert>
      );
    }

    return (
      <Table striped bordered responsive>
        <thead>
          <tr>
            <th>Controller</th>
            <th>Type</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {availableControllers.map((controller) => (
            <tr key={controller.id}>
              <td>{controller.name}</td>
              <td>{controller.controllerType}</td>
              <td>{controller.description || 'No description available'}</td>
              <td>
                <Button 
                  variant="outline-success" 
                  size="sm"
                  onClick={() => {
                    handleControllerSelect(controller);
                    setShowModal(true);
                  }}
                >
                  <FaPlus /> Attach
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  return (
    <div className="property-controller">
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Property Controllers</h5>
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => setShowModal(true)}
            disabled={availableControllers.length === 0}
          >
            <FaPlus className="me-1" /> Attach Controller
          </Button>
        </Card.Header>
        <Card.Body>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k || 'attached')}
            className="mb-3"
          >
            <Tab eventKey="attached" title="Attached Controllers">
              {renderAttachedControllers()}
            </Tab>
            <Tab eventKey="available" title="Available Controllers">
              {renderAvailableControllers()}
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* Attach Controller Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedController 
              ? `Attach ${selectedController.name}` 
              : 'Attach Controller'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!selectedController ? (
            <div className="mb-3">
              <Form.Group>
                <Form.Label>Select Controller</Form.Label>
                <Form.Select 
                  onChange={(e) => {
                    const selected = controllers?.find(c => c.id === e.target.value);
                    if (selected) handleControllerSelect(selected);
                  }}
                  value={selectedController?.id || ''}
                >
                  <option value="">Select a controller...</option>
                  {availableControllers.map(controller => (
                    <option key={controller.id} value={controller.id}>
                      {controller.name} ({controller.controllerType})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
          ) : (
            <>
              <div className="mb-3">
                <h6>Controller Details</h6>
                <p><strong>Name:</strong> {selectedController.name}</p>
                <p><strong>Type:</strong> {selectedController.controllerType}</p>
                <p><strong>Description:</strong> {selectedController.description || 'No description available'}</p>
              </div>

              {renderRequiredFields()}

              <Form.Group className="mb-3">
                <Form.Label>Configuration (JSON)</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={8} 
                  value={configuration}
                  onChange={(e) => setConfiguration(e.target.value)}
                  isInvalid={!!configError}
                />
                <Form.Control.Feedback type="invalid">
                  {configError}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Enter controller configuration in JSON format. Required fields: {selectedController.configTemplate?.requiredFields.join(', ')}
                </Form.Text>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAttachController}
            disabled={!selectedController || attachController.isLoading}
          >
            {attachController.isLoading ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Attaching...
              </>
            ) : (
              <>Attach Controller</>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PropertyController; 