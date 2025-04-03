/**
 * Types for the Controller Service
 */

/** Status of a controller */
export interface ControllerStatus {
  hasController: boolean;
  status: 'active' | 'paused' | 'error' | null;
  lastRun: string | null;
  nextRun?: string | null;
  runCount?: number;
  errorCount?: number;
  controllerType?: string;
  controllerName?: string;
}

/** Configuration for a controller */
export interface ControllerConfig {
  id?: string;
  name: string;
  description?: string;
  entityType: 'state' | 'county';
  entityId: string;
  type: 'scheduled' | 'manual' | 'event-driven';
  schedule?: string;
  triggerEvent?: string;
  parameters?: Record<string, unknown>;
  isActive: boolean;
}

/** History item for a controller execution */
export interface ControllerHistoryItem {
  id: string;
  timestamp: string;
  status: 'success' | 'error' | 'running';
  duration?: number;
  error?: string;
  result?: unknown;
}

/** Error response from the API */
export interface ControllerError {
  message: string;
  code?: string;
  details?: unknown;
}

/** Response wrapper for API calls */
export interface ControllerResponse<T> {
  data: T;
  error?: ControllerError;
}

/** Parameters for controller execution */
export interface ControllerExecutionParams {
  parameters?: Record<string, any>;
  force?: boolean;
  priority?: 'low' | 'normal' | 'high';
}

/** Template for creating controllers */
export interface ControllerTemplate {
  id: string;
  name: string;
  description: string;
  type: ControllerConfig['type'];
  defaultParameters: Record<string, unknown>;
  supportedEntityTypes: ('state' | 'county')[];
  requiredPermissions?: string[];
  version: string;
} 