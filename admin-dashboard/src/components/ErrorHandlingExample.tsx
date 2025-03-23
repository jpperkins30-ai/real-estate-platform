import React, { useState } from 'react';
import { 
  Button, 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  CircularProgress,
  Box,
  Divider
} from '@mui/material';
import ErrorDisplay from './ErrorDisplay';
import useErrorHandler from '../hooks/useErrorHandler';
import { createAppError } from '../services/errorService';

/**
 * Example component that demonstrates error handling patterns
 */
const ErrorHandlingExample: React.FC = () => {
  const { error, loading, handleError, clearError, executeAsync } = useErrorHandler();
  const [simpleError, setSimpleError] = useState<Error | null>(null);
  
  // Example function that simulates an API call with various error types
  const simulateApiCall = async (errorType?: string): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate different error types based on parameter
    if (errorType === 'network') {
      throw createAppError({
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to the server',
        details: { status: 0, retryable: true }
      });
    } else if (errorType === 'auth') {
      throw createAppError({
        code: 'AUTH_INVALID_TOKEN',
        message: 'Your session has expired',
        details: { status: 401 }
      });
    } else if (errorType === 'validation') {
      throw createAppError({
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: { 
          fields: [
            { field: 'email', error: 'Invalid email format' },
            { field: 'password', error: 'Password too short' }
          ] 
        }
      });
    } else if (errorType === 'server') {
      throw createAppError({
        code: 'SERVER_ERROR',
        message: 'An unexpected error occurred on the server',
        details: { status: 500, requestId: 'req-123-456' }
      });
    }
    
    // If no error type specified, simulate successful call
    return;
  };
  
  // Example 1: Basic error handling with try-catch
  const handleBasicExample = async () => {
    try {
      setSimpleError(null);
      await simulateApiCall('network');
    } catch (err) {
      setSimpleError(err as Error);
    }
  };
  
  // Example 2: Using the custom hook for error handling
  const handleHookExample = async (errorType: string) => {
    executeAsync(() => simulateApiCall(errorType));
  };
  
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', my: 4 }}>
      <Typography variant="h4" gutterBottom>Error Handling Examples</Typography>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6">Example 1: Basic Error Handling</Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Simple try-catch approach with basic error display
          </Typography>
          
          {simpleError && (
            <ErrorDisplay 
              error={simpleError}
              onClose={() => setSimpleError(null)}
              variant="outlined"
            />
          )}
        </CardContent>
        <CardActions>
          <Button 
            onClick={handleBasicExample}
            variant="contained" 
            color="primary"
          >
            Trigger Network Error
          </Button>
        </CardActions>
      </Card>
      
      <Card>
        <CardContent>
          <Typography variant="h6">Example 2: Hook-based Error Handling</Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Using the useErrorHandler hook for more advanced handling
          </Typography>
          
          {error && (
            <ErrorDisplay 
              error={error} 
              onClose={clearError}
              onRetry={() => handleHookExample('auth')} 
              showDetails={true}
            />
          )}
          
          {loading && (
            <Box display="flex" justifyContent="center" my={2}>
              <CircularProgress size={24} />
            </Box>
          )}
        </CardContent>
        <Divider />
        <CardActions>
          <Box display="flex" gap={1} p={1}>
            <Button 
              onClick={() => handleHookExample('auth')}
              variant="outlined" 
              color="primary"
              disabled={loading}
            >
              Auth Error
            </Button>
            <Button 
              onClick={() => handleHookExample('validation')}
              variant="outlined" 
              color="primary"
              disabled={loading}
            >
              Validation Error
            </Button>
            <Button 
              onClick={() => handleHookExample('server')}
              variant="outlined" 
              color="error"
              disabled={loading}
            >
              Server Error
            </Button>
          </Box>
        </CardActions>
      </Card>
    </Box>
  );
};

export default ErrorHandlingExample; 