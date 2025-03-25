import React, { useState } from 'react';
import { 
  Card, 
  ListGroup, 
  Badge, 
  Button, 
  Modal, 
  Form, 
  Alert, 
  Spinner 
} from 'react-bootstrap';
import { 
  useAttachController, 
  useDetachController, 
  useRunController, 
  useControllers 
} from '../../../services/inventoryService';
import { ControllerReference } from '../../../types/inventory';
import { FaPlay, FaPause, FaTrash, FaPlus, FaEdit, FaCog } from 'react-icons/fa';

interface AttachedControllersProps {
  objectType: 'state' | 'county' | 'property';
  objectId: string;
  controllers?: ControllerReference[];
  onControllerUpdate?: () => void;
}

const AttachedControllers: React.FC<AttachedControllersProps> = ({
  objectType,
  objectId,
  controllers = [],
  onControllerUpdate
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedControllerId, setSelectedControllerId] = useState<string>('');
  const [configuration, setConfiguration] = useState<Record<string, any>>({});
  const [configError, setConfigError] = useState<string | null>(null);

  const { data: availableControllers, isLoading: loadingControllers } = useControllers();
  const attachController = useAttachController();
  const detachController = useDetachController();
  const runController = useRunController();

  const handleClose = () => {
    setShowModal(false);
    setSelectedControllerId('');
    setConfiguration({});
    setConfigError(null);
  };

  const handleShow = () => {
    setShowModal(true);
  };

  const handleAttach = async () => {
    if (!selectedControllerId) {
      setConfigError('Please select a controller');
      return;
    }

    try {
      await attachController.mutateAsync({
        controllerId: selectedControllerId,
        objectType,
        objectId,
        configuration
      });
      
      handleClose();
      if (onControllerUpdate) {
        onControllerUpdate();
      }
    } catch (error) {
      console.error('Error attaching controller:', error);
      setConfigError('Failed to attach controller. Please try again.');
    }
  };

  const handleDetach = async (controllerId: string) => {
    try {
      await detachController.mutateAsync({
        controllerId,
        objectType,
        objectId
      });
      
      if (onControllerUpdate) {
        onControllerUpdate();
      }
    } catch (error) {
      console.error('Error detaching controller:', error);
    }
  };

  const handleRun = async (controllerId: string) => {
    try {
      await runController.mutateAsync({
        controllerId,
        objectType,
        objectId
      });
      
      if (onControllerUpdate) {
        onControllerUpdate();
      }
    } catch (error) {
      console.error('Error running controller:', error);
    }
  };

  const handleToggleEnabled = async (controller: ControllerReference) => {
    try {
      await attachController.mutateAsync({
        controllerId: controller.controllerId,
        objectType,
        objectId,
        configuration: {
          ...controller.configuration,
          enabled: !controller.enabled
        }
      });
      
      if (onControllerUpdate) {
        onControllerUpdate();
      }
    } catch (error) {
      console.error('Error updating controller:', error);
    }
  };

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    try {
      const value = e.target.value;
      // Attempt to parse as JSON if it starts with { or [
      if ((value.startsWith('{') || value.startsWith('[')) && value.trim() !== '') {
        setConfiguration(JSON.parse(value));
      } else {
        setConfiguration({ value });
      }
      setConfigError(null);
    } catch (error) {
      setConfigError('Invalid JSON configuration');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  if (loadingControllers) {
    return <Spinner animation="border" />;
  }

  return (
    <>
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Attached Controllers</h5>
          <Button variant="primary" size="sm" onClick={handleShow}>
            <FaPlus className="me-1" /> Attach Controller
          </Button>
        </Card.Header>
        {controllers.length === 0 ? (
          <Card.Body>
            <p className="text-muted">No controllers attached to this {objectType}.</p>
          </Card.Body>
        ) : (
          <ListGroup variant="flush">
            {controllers.map((controller) => (
              <ListGroup.Item key={controller.controllerId} className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="d-flex align-items-center">
                    <h6 className="mb-0 me-2">{controller.controllerType}</h6>
                    <Badge bg={controller.enabled ? 'success' : 'secondary'}>
                      {controller.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <small className="text-muted d-block">
                    Last Run: {formatDate(controller.lastRun)}
                  </small>
                  <small className="text-muted d-block">
                    Next Run: {formatDate(controller.nextScheduledRun)}
                  </small>
                </div>
                <div>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="me-1"
                    onClick={() => handleRun(controller.controllerId)}
                    title="Run Now"
                  >
                    <FaPlay />
                  </Button>
                  <Button 
                    variant={controller.enabled ? 'outline-warning' : 'outline-success'} 
                    size="sm" 
                    className="me-1"
                    onClick={() => handleToggleEnabled(controller)}
                    title={controller.enabled ? 'Disable' : 'Enable'}
                  >
                    {controller.enabled ? <FaPause /> : <FaPlay />}
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => handleDetach(controller.controllerId)}
                    title="Detach"
                  >
                    <FaTrash />
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Attach Controller</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {configError && <Alert variant="danger">{configError}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Controller Type</Form.Label>
              <Form.Select 
                value={selectedControllerId} 
                onChange={(e) => setSelectedControllerId(e.target.value)}
              >
                <option value="">Select a controller</option>
                {availableControllers?.map((controller) => (
                  <option key={controller.id} value={controller.id}>
                    {controller.name} - {controller.type}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Configuration (JSON)</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={5} 
                placeholder="Enter configuration as JSON"
                onChange={handleConfigChange}
              />
              <Form.Text className="text-muted">
                Enter controller configuration as a JSON object.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAttach}
            disabled={!selectedControllerId || attachController.isLoading}
          >
            {attachController.isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" />
                Attaching...
              </>
            ) : (
              'Attach Controller'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AttachedControllers; 