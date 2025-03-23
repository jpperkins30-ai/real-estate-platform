import axios, { AxiosError } from 'axios';

/**
 * Standardized error structure for consistent error handling
 */
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  path?: string;
  statusCode?: number;
}

/**
 * Create a standardized error from any error type
 */
export function createAppError(error: any): AppError {
  const timestamp = new Date().toISOString();
  let path = '';
  
  // Extract current route if available
  if (typeof window !== 'undefined') {
    path = window.location.pathname;
  }

  // If it's an Axios error
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    return {
      code: axiosError.response?.data?.code || `HTTP_${axiosError.response?.status || 'ERROR'}`,
      message: axiosError.response?.data?.message || axiosError.message,
      details: axiosError.response?.data?.details || axiosError.response?.data,
      timestamp,
      path,
      statusCode: axiosError.response?.status
    };
  }

  // If it's already our AppError format
  if (error && error.code && error.message && error.timestamp) {
    return error as AppError;
  }

  // For general Error objects
  if (error instanceof Error) {
    return {
      code: 'CLIENT_ERROR',
      message: error.message,
      details: error.stack,
      timestamp,
      path
    };
  }

  // For anything else
  return {
    code: 'UNKNOWN_ERROR',
    message: typeof error === 'string' ? error : 'An unknown error occurred',
    details: error,
    timestamp,
    path
  };
}

/**
 * Log an error to the console (and potentially a remote service)
 */
export function logError(error: any): void {
  const appError = createAppError(error);
  
  console.error('[Error]', appError);
  
  // Here you would send the error to a remote logging service if needed
  // Example: sendToErrorLoggingService(appError);
}

/**
 * Function to send errors to a remote logging service
 * This is a placeholder for actual implementation
 */
function sendToErrorLoggingService(error: AppError): void {
  // Implementation for a service like Sentry, LogRocket, etc.
  // Example for Sentry:
  // Sentry.captureException(error);
}

/**
 * Get a user-friendly error message from an error
 */
export function getUserFriendlyMessage(error: any): string {
  const appError = createAppError(error);
  
  // Map error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    'AUTH_NO_TOKEN': 'You need to sign in to access this feature.',
    'AUTH_INVALID_TOKEN': 'Your session has expired. Please sign in again.',
    'AUTH_REQUIRED': 'Authentication is required for this operation.',
    'AUTH_INSUFFICIENT_PERMISSIONS': 'You don\'t have permission to perform this action.',
    'VALIDATION_ERROR': 'Please check your input and try again.',
    'NOT_FOUND': 'The requested resource could not be found.',
    'SERVER_ERROR': 'Sorry, something went wrong on our end. Please try again later.'
  };
  
  // Use specific message if available, otherwise use default
  return errorMessages[appError.code] || appError.message || 'An unexpected error occurred. Please try again.';
}

/**
 * Check if an error is a specific type
 */
export function isErrorType(error: any, codePrefix: string): boolean {
  const appError = createAppError(error);
  return appError.code.startsWith(codePrefix);
}

export default {
  createAppError,
  logError,
  getUserFriendlyMessage,
  isErrorType
}; 