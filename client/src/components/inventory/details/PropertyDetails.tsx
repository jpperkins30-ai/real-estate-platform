import React from 'react';
import { useParams, Link } from 'react-router-dom';

interface PropertyDetailsProps {
  propertyId?: string;
}

const PropertyDetails: React.FC<PropertyDetailsProps> = ({ propertyId: propPropertyId }) => {
  // Get propertyId from route params if not provided as prop
  const { propertyId: paramPropertyId } = useParams<{ propertyId: string }>();
  const propertyId = propPropertyId || paramPropertyId;

  if (!propertyId) {
    return <div>Error: No property ID provided</div>;
  }

  return (
    <div className="property-details">
      <h2>Property Details</h2>
      <p>Property ID: {propertyId}</p>
      <p>This is a placeholder for the Property Details component.</p>
      <p>In a complete implementation, this would show detailed property information.</p>
      
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

export default PropertyDetails; 