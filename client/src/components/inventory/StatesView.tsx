import React from 'react';
import { Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useInventory } from '../../context/InventoryContext';
import { FaArrowRight, FaSync } from 'react-icons/fa';

const StatesView: React.FC = () => {
  const { states, isLoading, error, refreshStates, setSelectedState } = useInventory();

  const handleStateClick = (state: any) => {
    setSelectedState(state);
  };

  if (isLoading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading states...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error Loading States</Alert.Heading>
        <p>{error.message || 'An unknown error occurred.'}</p>
        <Button variant="outline-danger" onClick={() => refreshStates()}>
          <FaSync className="me-2" /> Try Again
        </Button>
      </Alert>
    );
  }

  if (!states || states.length === 0) {
    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>States</h1>
          <Button variant="primary" onClick={() => refreshStates()}>
            <FaSync className="me-2" /> Refresh
          </Button>
        </div>
        <Alert variant="info">
          <p className="mb-0">No states found. Please add states to view them here.</p>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>States</h1>
        <Button variant="primary" onClick={() => refreshStates()}>
          <FaSync className="me-2" /> Refresh
        </Button>
      </div>
      
      <Row xs={1} md={2} lg={3} className="g-4">
        {states.map((state) => (
          <Col key={state.id}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title>{state.name}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{state.abbreviation}</Card.Subtitle>
                <Card.Text>
                  {state.metadata?.totalCounties || 0} counties
                  <br />
                  {state.metadata?.totalProperties || 0} properties
                </Card.Text>
              </Card.Body>
              <Card.Footer className="bg-white">
                <Link 
                  to={`/inventory/states/${state.id}`} 
                  className="btn btn-outline-primary w-100"
                  onClick={() => handleStateClick(state)}
                >
                  View Counties <FaArrowRight className="ms-2" />
                </Link>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default StatesView; 