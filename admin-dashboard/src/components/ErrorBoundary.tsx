import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { logError, createAppError } from '../services/errorService';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component that catches JavaScript errors in its child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the whole app.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to our error service
    const appError = createAppError(error);
    appError.details = {
      ...appError.details,
      componentStack: errorInfo.componentStack
    };
    
    logError(appError);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Otherwise use our default fallback UI
      return (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="200px"
          p={3}
        >
          <Paper 
            elevation={3}
            sx={{ 
              p: 4, 
              maxWidth: 500, 
              width: '100%',
              textAlign: 'center' 
            }}
          >
            <Typography variant="h5" color="error" gutterBottom>
              Something went wrong
            </Typography>
            
            <Typography variant="body1" color="textSecondary" paragraph>
              The application encountered an unexpected error. 
              We've logged the issue and our team is working on it.
            </Typography>
            
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <Box 
                bgcolor="#f5f5f5" 
                p={2} 
                borderRadius={1} 
                mb={3}
                textAlign="left"
                overflow="auto"
                maxHeight={150}
              >
                <Typography variant="caption" component="pre">
                  {this.state.error.toString()}
                </Typography>
              </Box>
            )}
            
            <Button 
              variant="contained" 
              color="primary" 
              onClick={this.handleReset}
            >
              Try Again
            </Button>
          </Paper>
        </Box>
      );
    }

    // When there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary; 