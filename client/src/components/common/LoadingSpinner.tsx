import React from 'react';
import { Spinner } from 'react-bootstrap';

interface LoadingSpinnerProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'sm';
  message?: string;
  fullPage?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  variant = 'primary',
  size,
  message = 'Loading...',
  fullPage = false
}) => {
  const spinner = (
    <Spinner 
      animation="border" 
      role="status" 
      variant={variant}
      size={size}
    >
      <span className="visually-hidden">{message}</span>
    </Spinner>
  );

  if (fullPage) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          {spinner}
          <p className="mt-2">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center p-4">
      {spinner}
      <p className="mt-2">{message}</p>
    </div>
  );
};

export default LoadingSpinner; 