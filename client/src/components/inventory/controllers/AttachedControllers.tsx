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
import { ControllerReference, ControllableObjectType } from '../../../types/inventory';
import { FaPlay, FaPause, FaTrash, FaPlus, FaEdit, FaCog } from 'react-icons/fa';
import { Link } from 'react-router-dom';

interface Controller {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'paused' | 'scheduled';
  lastRun?: string;
}

interface AttachedControllersProps {
  entityId: string;
  entityType: 'state' | 'county' | 'property';
}

export const AttachedControllers: React.FC<AttachedControllersProps> = ({ 
  entityId, 
  entityType 
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
      const selectedController = availableControllers?.find(c => c.id === selectedControllerId);
      if (!selectedController) {
        setConfigError('Selected controller not found');
        return;
      }

      await attachController.mutateAsync({
        controllerId: selectedControllerId,
        objectType: entityType,
        objectId: entityId,
        controllerType: selectedController.type,
        configuration
      });
      
      handleClose();
    } catch (error) {
      console.error('Error attaching controller:', error);
      setConfigError('Failed to attach controller. Please try again.');
    }
  };

  const handleDetach = async (controllerId: string) => {
    try {
      await detachController.mutateAsync({
        controllerId,
        objectType: entityType,
        objectId: entityId
      });
    } catch (error) {
      console.error('Error detaching controller:', error);
    }
  };

  const handleRun = async (controllerId: string) => {
    try {
      await runController.mutateAsync({
        controllerId,
        objectType: entityType,
        objectId: entityId
      });
    } catch (error) {
      console.error('Error running controller:', error);
    }
  };

  const handleToggleEnabled = async (controller: ControllerReference) => {
    try {
      await attachController.mutateAsync({
        controllerId: controller.controllerId,
        objectType: entityType,
        objectId: entityId,
        controllerType: controller.controllerType,
        configuration: {
          ...controller.configuration,
          enabled: !controller.enabled
        }
      });
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

  // Mock data - in a real app this would come from an API call
  const controllers: Controller[] = [
    {
      id: 'ctrl-1',
      name: 'Basic Data Collector',
      type: 'data-collection',
      status: 'active',
      lastRun: '2025-03-25T14:30:00Z'
    },
    {
      id: 'ctrl-2',
      name: 'Tax Lien Monitor',
      type: 'monitoring',
      status: 'scheduled'
    }
  ];

  return (
    <div className="attached-controllers">
      <div className="controllers-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3>Attached Controllers</h3>
        <Link 
          to={`/inventory/controllers/wizard?${entityType}=${entityId}`}
          style={{
            display: 'inline-block',
            padding: '6px 12px',
            backgroundColor: '#4a86e8',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        >
          + Add Controller
        </Link>
      </div>

      {controllers.length > 0 ? (
        <div className="controllers-list">
          {controllers.map(controller => (
            <div 
              key={controller.id}
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '12px',
                backgroundColor: 'white'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h4 style={{ margin: '0 0 8px 0' }}>{controller.name}</h4>
                <span 
                  style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    backgroundColor: 
                      controller.status === 'active' ? '#e6f4ea' : 
                      controller.status === 'paused' ? '#feefc3' : '#e8f0fe',
                    color: 
                      controller.status === 'active' ? '#137333' : 
                      controller.status === 'paused' ? '#ea8600' : '#1967d2'
                  }}
                >
                  {controller.status.charAt(0).toUpperCase() + controller.status.slice(1)}
                </span>
              </div>
              <div style={{ color: '#5f6368', fontSize: '14px', marginBottom: '8px' }}>
                Type: {controller.type}
              </div>
              {controller.lastRun && (
                <div style={{ fontSize: '13px', color: '#80868b' }}>
                  Last run: {new Date(controller.lastRun).toLocaleString()}
                </div>
              )}
              <div style={{ marginTop: '12px' }}>
                <button style={{ marginRight: '8px', padding: '4px 8px', fontSize: '13px' }}>
                  Run Now
                </button>
                <button style={{ marginRight: '8px', padding: '4px 8px', fontSize: '13px' }}>
                  Edit
                </button>
                <button style={{ padding: '4px 8px', fontSize: '13px' }}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '20px', textAlign: 'center', color: '#5f6368' }}>
          No controllers are attached to this {entityType}.
          <div style={{ marginTop: '10px' }}>
            <Link to={`/inventory/controllers/wizard?${entityType}=${entityId}`}>
              Add your first controller
            </Link>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default AttachedControllers; 