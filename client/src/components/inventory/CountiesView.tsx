import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, Container, Row, Col, Spinner, Alert, Breadcrumb } from 'react-bootstrap';
import { useState, useCounties } from '../../services/inventoryService';

const CountiesView: React.FC = () => {
  const { stateId } = useParams<{ stateId: string }>();
  const { 
    data: state, 
    isLoading: stateLoading, 
    error: stateError 
  } = useState(stateId);
  
  const { 
    data: counties, 
    isLoading: countiesLoading, 
    error: countiesError 
  } = useCounties(stateId);

  const isLoading = stateLoading || countiesLoading;
  const error = stateError || countiesError;

  if (isLoading) {
    return (
      <Container className="my-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-4">
        <Alert variant="danger">
          Error loading data: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      </Container>
    );
  }

  if (!state) {
    return (
      <Container className="my-4">
        <Alert variant="warning">State not found.</Alert>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/inventory/states" }}>
          States
        </Breadcrumb.Item>
        <Breadcrumb.Item active>{state.name}</Breadcrumb.Item>
      </Breadcrumb>

      <h1 className="mb-4">Counties in {state.name}</h1>
      
      {(!counties || counties.length === 0) ? (
        <Alert variant="info">No counties found for this state.</Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {counties.map((county) => (
            <Col key={county.id}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>{county.name}</Card.Title>
                  {county.fips && (
                    <Card.Subtitle className="mb-2 text-muted">FIPS: {county.fips}</Card.Subtitle>
                  )}
                  <Card.Text>
                    {county.population && (
                      <div>Population: {county.population.toLocaleString()}</div>
                    )}
                    {county.area && (
                      <div>Area: {county.area.toLocaleString()} sq mi</div>
                    )}
                    {county.dataLastUpdated && (
                      <div>Last Updated: {new Date(county.dataLastUpdated).toLocaleDateString()}</div>
                    )}
                  </Card.Text>
                </Card.Body>
                <Card.Footer>
                  <Link to={`/inventory/counties/${county.id}/properties`} className="btn btn-primary">
                    View Properties
                  </Link>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default CountiesView; 