import logger from './logger';
import { performance } from 'perf_hooks';

/**
 * Log a database operation with relevant context
 * @param operation - The database operation being performed (find, insert, update, etc.)
 * @param collection - The database collection being accessed
 * @param query - The query parameters or document data 
 * @param result - The result of the operation (optional)
 */
export const logDbOperation = (
  operation: string, 
  collection: string, 
  query: Record<string, any> = {},
  result: Record<string, any> = {}
) => {
  logger.debug(`DB ${operation} on ${collection}`, {
    domain: 'database',
    operation,
    collection,
    query,
    result
  });
};

/**
 * Log an authentication event
 * @param event - The authentication event (login, logout, register, etc.)
 * @param userId - The user ID associated with the event 
 * @param success - Whether the authentication was successful
 * @param meta - Additional metadata
 */
export const logAuthEvent = (
  event: string, 
  userId: string, 
  success: boolean, 
  meta: Record<string, any> = {}
) => {
  const level = success ? 'info' : 'warn';
  logger.log(level, `Auth ${event}`, {
    event,
    userId,
    success,
    ...meta
  });
};

/**
 * Log property actions (create, update, delete, view)
 */
export const logPropertyAction = (
  action: 'create' | 'update' | 'delete' | 'view' | string,
  propertyId: string,
  userId?: string,
  meta: Record<string, any> = {}
) => {
  logger.info(`Property ${action}`, {
    domain: 'property',
    action,
    propertyId,
    userId,
    ...meta
  });
};

/**
 * Log application performance metrics
 * @param metricName - The name of the metric being logged
 * @param durationMs - The duration in milliseconds
 * @param meta - Additional context
 */
export const logPerformance = (
  metricName: string, 
  durationMs: number, 
  meta: Record<string, any> = {}
) => {
  logger.debug(`Performance: ${metricName}`, {
    metric: metricName,
    durationMs,
    ...meta
  });
};

/**
 * Start a performance timer and return a function to end it
 * Returns a function that when called, returns the elapsed time in ms
 */
export const startPerformanceTimer = (label: string) => {
  const start = performance.now();
  
  return () => {
    const end = performance.now();
    const duration = end - start;
    return Math.round(duration);
  };
};

/**
 * Log an API request event
 * @param method - HTTP method
 * @param endpoint - API endpoint
 * @param userId - User making the request (if authenticated)
 * @param meta - Additional metadata
 */
export const logApiRequest = (
  method: string,
  path: string,
  statusCode: number,
  responseTime: number,
  userId?: string,
  meta: Record<string, any> = {}
) => {
  logger.http(`API ${method} ${path} ${statusCode}`, {
    domain: 'api',
    method,
    path,
    statusCode,
    responseTime,
    userId,
    ...meta
  });
};

/**
 * Log data collection operation
 */
export const logCollectionOperation = (
  sourceId: string,
  collectorType: string,
  status: 'start' | 'success' | 'error',
  meta: Record<string, any> = {}
) => {
  logger.info(`Data collection ${status}`, {
    domain: 'collection',
    sourceId,
    collectorType,
    status,
    ...meta
  });
};

/**
 * Log data transformation operation
 */
export const logTransformation = (
  transformationType: string,
  status: 'start' | 'success' | 'error',
  meta: Record<string, any> = {}
) => {
  logger.info(`Data transformation ${status}`, {
    domain: 'transformation',
    transformationType,
    status,
    ...meta
  });
};

/**
 * Log search operation
 */
export const logSearch = (
  searchType: string,
  query: Record<string, any>,
  resultCount: number,
  responseTime: number,
  userId?: string
) => {
  logger.info(`Search ${searchType}`, {
    domain: 'search',
    searchType,
    query,
    resultCount,
    responseTime,
    userId
  });
};

/**
 * Log security events
 */
export const logSecurityEvent = (
  eventType: string,
  status: 'success' | 'failure',
  userId?: string,
  meta: Record<string, any> = {}
) => {
  const logLevel = status === 'failure' ? 'warn' : 'info';
  
  logger.log(logLevel, `Security ${eventType} ${status}`, {
    domain: 'security',
    eventType,
    status,
    userId,
    ...meta
  });
};

export default {
  logDbOperation,
  logAuthEvent,
  logPropertyAction,
  logPerformance,
  startPerformanceTimer,
  logApiRequest,
  logCollectionOperation,
  logTransformation,
  logSearch,
  logSecurityEvent
}; 