import React, { useEffect } from 'react';
import { Row, Col, Card, Button, Spinner, Alert, Breadcrumb } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useInventory } from '../../context/InventoryContext';
import { fetchStates } from '../../services/api';
import { FaArrowRight, FaArrowLeft, FaSync } from 'react-icons/fa';

const CountiesView: React.FC = () => {
  const { stateId } = useParams<{ stateId: string }>();
  const navigate = useNavigate();
  const { 
    selectedState,
    setSelectedState, 
    setSelectedCounty,
    counties,
    states,
    isLoading,
    error,
    refreshCounties
  } = useInventory();

  useEffect(() => {
    // If we have states but no selected state, find it by ID
    if (states && states.length > 0 && stateId && (!selectedState || selectedState.id !== stateId)) {
      const foundState = states.find(state => state.id === stateId);
      if (foundState) {
        setSelectedState(foundState);
      }
    }

    // If we don't have states or can't find the state, navigate back
    if (states && states.length > 0 && stateId && !states.find(state => state.id === stateId)) {
      navigate('/inventory/states');
    }
  }, [stateId, states, selectedState, setSelectedState, navigate]);

  const handleCountyClick = (county: any) => {
    setSelectedCounty(county);
  };

  if (isLoading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading counties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error Loading Counties</Alert.Heading>
        <p>{error.message || 'An unknown error occurred.'}</p>
        <Button variant="outline-danger" onClick={() => refreshCounties()}>
          <FaSync className="me-2" /> Try Again
        </Button>
      </Alert>
    );
  }

  if (!selectedState) {
    return (
      <Alert variant="warning">
        <Alert.Heading>No State Selected</Alert.Heading>
        <p>Please select a state to view its counties.</p>
        <Link to="/inventory/states" className="btn btn-primary">
          <FaArrowLeft className="me-2" /> Back to States
        </Link>
      </Alert>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Breadcrumb>
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/inventory/states" }}>
            States
          </Breadcrumb.Item>
          <Breadcrumb.Item active>{selectedState.name}</Breadcrumb.Item>
        </Breadcrumb>
        <Button variant="primary" onClick={() => refreshCounties()}>
          <FaSync className="me-2" /> Refresh
        </Button>
      </div>

      <h1 className="mb-4">{selectedState.name} Counties</h1>
      
      {(!counties || counties.length === 0) ? (
        <Alert variant="info">
          <p className="mb-0">No counties found for {selectedState.name}.</p>
        </Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {counties.map((county) => (
            <Col key={county.id}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title>{county.name}</Card.Title>
                  <Card.Text>
                    {county.metadata?.totalProperties || 0} properties
                    {county.fips && (
                      <>
                        <br />
                        FIPS: {county.fips}
                      </>
                    )}
                    {county.population && (
                      <>
                        <br />
                        Population: {county.population.toLocaleString()}
                      </>
                    )}
                  </Card.Text>
                </Card.Body>
                <Card.Footer className="bg-white">
                  <Link 
                    to={`/inventory/counties/${county.id}/properties`}
                    className="btn btn-outline-primary w-100"
                    onClick={() => handleCountyClick(county)}
                  >
                    View Properties <FaArrowRight className="ms-2" />
                  </Link>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default CountiesView; 