import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useStates } from '../../services/inventoryService';

const StatesView: React.FC = () => {
  const { data: states, isLoading, error } = useStates();

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
          Error loading states: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      </Container>
    );
  }

  if (!states || states.length === 0) {
    return (
      <Container className="my-4">
        <Alert variant="info">No states found in the system.</Alert>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <h1 className="mb-4">States</h1>
      <Row xs={1} md={2} lg={3} className="g-4">
        {states.map((state) => (
          <Col key={state.id}>
            <Card className="h-100">
              <Card.Body>
                <Card.Title>{state.name}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{state.abbreviation}</Card.Subtitle>
                {state.region && (
                  <Card.Text>Region: {state.region}</Card.Text>
                )}
              </Card.Body>
              <Card.Footer>
                <Link to={`/inventory/states/${state.id}`} className="btn btn-primary">
                  View Counties
                </Link>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default StatesView; 