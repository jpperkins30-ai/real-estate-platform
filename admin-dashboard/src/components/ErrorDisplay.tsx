import React from 'react';
import { 
  Alert, 
  AlertTitle, 
  Box, 
  Typography, 
  Button, 
  Collapse,
  IconButton
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import { getUserFriendlyMessage } from '../services/errorService';

interface ErrorDisplayProps {
  error: any;
  onRetry?: () => void;
  onClose?: () => void;
  showDetails?: boolean;
  severity?: 'error' | 'warning' | 'info';
  variant?: 'standard' | 'filled' | 'outlined';
  title?: string;
}

/**
 * A reusable component for displaying errors in the UI
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onClose,
  showDetails = false,
  severity = 'error',
  variant = 'filled',
  title
}) => {
  const [expanded, setExpanded] = React.useState(false);
  const errorMessage = getUserFriendlyMessage(error);
  const errorDetails = error?.details || error?.response?.data || error;
  
  // Format details for display
  const hasDetails = errorDetails && typeof errorDetails === 'object';
  const formattedDetails = hasDetails 
    ? JSON.stringify(errorDetails, null, 2) 
    : String(errorDetails);

  return (
    <Alert
      severity={severity}
      variant={variant}
      action={
        <Box>
          {onClose && (
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={onClose}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          )}
          {onRetry && (
            <IconButton
              aria-label="retry"
              color="inherit"
              size="small"
              onClick={onRetry}
              sx={{ ml: 1 }}
            >
              <RefreshIcon fontSize="inherit" />
            </IconButton>
          )}
        </Box>
      }
      sx={{ mb: 2 }}
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      
      <Typography variant="body2">{errorMessage}</Typography>
      
      {showDetails && hasDetails && (
        <>
          <Button 
            size="small" 
            color="inherit" 
            onClick={() => setExpanded(!expanded)}
            sx={{ mt: 1, textTransform: 'none' }}
          >
            {expanded ? 'Hide Details' : 'Show Details'}
          </Button>
          
          <Collapse in={expanded}>
            <Box 
              mt={1} 
              p={1} 
              bgcolor="rgba(0, 0, 0, 0.04)" 
              borderRadius={1}
              overflow="auto"
              maxHeight={200}
            >
              <Typography 
                variant="caption" 
                component="pre" 
                sx={{ 
                  m: 0, 
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {formattedDetails}
              </Typography>
            </Box>
          </Collapse>
        </>
      )}
    </Alert>
  );
};

export default ErrorDisplay; 