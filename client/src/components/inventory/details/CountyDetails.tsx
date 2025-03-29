import React from 'react';
import { useParams, Link } from 'react-router-dom';

interface CountyDetailsProps {
  countyId?: string;
}

const CountyDetails: React.FC<CountyDetailsProps> = ({ countyId: propCountyId }) => {
  // Get countyId from route params if not provided as prop
  const { countyId: paramCountyId } = useParams<{ countyId: string }>();
  const countyId = propCountyId || paramCountyId;

  if (!countyId) {
    return <div>Error: No county ID provided</div>;
  }

  return (
    <div className="county-details">
      <h2>County Details</h2>
      <p>County ID: {countyId}</p>
      <p>This is a placeholder for the County Details component.</p>
      <p>In a complete implementation, this would show properties and other county information.</p>
      
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

export default CountyDetails; 