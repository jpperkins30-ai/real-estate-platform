import React from 'react';
import { useParams, Link } from 'react-router-dom';

interface StateDetailsProps {
  stateId?: string;
}

const StateDetails: React.FC<StateDetailsProps> = ({ stateId: propStateId }) => {
  // Get stateId from route params if not provided as prop
  const { stateId: paramStateId } = useParams<{ stateId: string }>();
  const stateId = propStateId || paramStateId;

  if (!stateId) {
    return <div>Error: No state ID provided</div>;
  }

  return (
    <div className="state-details">
      <h2>State Details</h2>
      <p>State ID: {stateId}</p>
      <p>This is a placeholder for the State Details component.</p>
      <p>In a complete implementation, this would show counties and other state information.</p>
      
      <div style={{ marginTop: '20px' }}>
        <Link 
          to="/inventory"
          style={{
            display: 'inline-block',
            padding: '8px 16px',
            backgroundColor: '#f0f0f0',
            textDecoration: 'none',
            color: '#333',
            borderRadius: '4px',
            marginRight: '10px'
          }}
        >
          Back to Inventory
        </Link>
      </div>
    </div>
  );
};

export default StateDetails; 