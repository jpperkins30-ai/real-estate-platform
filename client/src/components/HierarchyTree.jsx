import React, { useState, useEffect } from 'react';
import { ListGroup, Button, Card, Collapse } from 'react-bootstrap';
import { FaChevronDown, FaChevronRight, FaMapMarkerAlt, FaCity, FaFlag } from 'react-icons/fa';

const HierarchyTree = () => {
  const [states, setStates] = useState([]);
  const [expandedStates, setExpandedStates] = useState({});
  const [expandedCounties, setExpandedCounties] = useState({});

  useEffect(() => {
    fetchStateData();
  }, []);

  const fetchStateData = async () => {
    try {
      const response = await fetch('/api/properties/stats/state');
      const data = await response.json();
      setStates(data);

      // Initialize expansion state
      const stateExpansion = {};
      data.forEach(state => {
        stateExpansion[state.state] = false;
      });
      setExpandedStates(stateExpansion);
    } catch (error) {
      console.error('Error fetching state data', error);
    }
  };

  const fetchCountiesForState = async (state) => {
    try {
      const response = await fetch(`/api/properties/stats/county?state=${state}`);
      const data = await response.json();
      
      // Update state with county data
      setStates(prevStates => 
        prevStates.map(s => 
          s.state === state ? { ...s, counties: data } : s
        )
      );

      // Initialize county expansion state
      const countyExpansion = { ...expandedCounties };
      data.forEach(county => {
        countyExpansion[`${state}-${county.county}`] = false;
      });
      setExpandedCounties(countyExpansion);
    } catch (error) {
      console.error(`Error fetching counties for state ${state}`, error);
    }
  };

  const toggleStateExpansion = (state) => {
    // If we're expanding and we don't have county data yet, fetch it
    if (!expandedStates[state] && !states.find(s => s.state === state).counties) {
      fetchCountiesForState(state);
    }
    
    setExpandedStates(prev => ({
      ...prev,
      [state]: !prev[state]
    }));
  };

  const toggleCountyExpansion = (stateCode, county) => {
    const key = `${stateCode}-${county}`;
    setExpandedCounties(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <Card className="hierarchy-tree">
      <Card.Header>
        <h3>State/County Hierarchy</h3>
      </Card.Header>
      <Card.Body>
        <ListGroup variant="flush">
          {states.map(state => (
            <div key={state.state}>
              <ListGroup.Item 
                action 
                className="d-flex justify-content-between align-items-center"
                onClick={() => toggleStateExpansion(state.state)}
              >
                <div>
                  <FaFlag className="me-2" />
                  {state.state} 
                  <span className="text-muted ms-2">({state.count || 0} properties)</span>
                </div>
                {expandedStates[state.state] ? <FaChevronDown /> : <FaChevronRight />}
              </ListGroup.Item>
              
              <Collapse in={expandedStates[state.state]}>
                <div>
                  {state.counties && state.counties.map(county => (
                    <div key={`${state.state}-${county.county}`}>
                      <ListGroup.Item 
                        action 
                        className="d-flex justify-content-between align-items-center ps-4"
                        onClick={() => toggleCountyExpansion(state.state, county.county)}
                      >
                        <div>
                          <FaCity className="me-2" />
                          {county.county}
                          <span className="text-muted ms-2">({county.count || 0} properties)</span>
                        </div>
                        <div>
                          <Button size="sm" variant="outline-primary" className="me-2">View</Button>
                          {expandedCounties[`${state.state}-${county.county}`] ? <FaChevronDown /> : <FaChevronRight />}
                        </div>
                      </ListGroup.Item>
                      
                      <Collapse in={expandedCounties[`${state.state}-${county.county}`]}>
                        <div>
                          <ListGroup.Item className="ps-5 bg-light">
                            <div className="d-flex justify-content-between">
                              <div>
                                <strong>Property Types:</strong> {county.propertyTypes?.join(', ') || 'N/A'}
                              </div>
                              <div>
                                <Button size="sm" variant="primary">View Properties</Button>
                              </div>
                            </div>
                          </ListGroup.Item>
                        </div>
                      </Collapse>
                    </div>
                  ))}
                </div>
              </Collapse>
            </div>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default HierarchyTree; 