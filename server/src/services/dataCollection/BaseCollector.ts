import { CollectorDefinition, DataSource, CollectionResult } from '../../types/collector';
import { logger } from '../../utils/collectorLogger';

/**
 * Abstract base class for collectors
 * Provides common functionality and enforces implementation of required methods
 */
export abstract class BaseCollector implements CollectorDefinition {
  id: string;
  name: string;
  description: string;
  supportedSourceTypes: string[];

  constructor(id: string, name: string, description: string, supportedSourceTypes: string[]) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.supportedSourceTypes = supportedSourceTypes;
  }

  /**
   * Main execution method for the collector
   * Must be implemented by concrete collector classes
   * @param source The data source configuration
   * @returns A collection result with success/failure information
   */
  abstract execute(source: DataSource): Promise<CollectionResult>;

  /**
   * Validates a data source configuration
   * Default implementation checks if source type is supported
   * @param source The data source to validate
   * @returns Validation result with valid flag and optional message
   */
  async validateSource(source: DataSource): Promise<{ valid: boolean; message?: string }> {
    // Check if the source type is supported
    if (!this.supportedSourceTypes.includes(source.type)) {
      return { 
        valid: false, 
        message: `Source type "${source.type}" is not supported by this collector. Supported types: ${this.supportedSourceTypes.join(', ')}` 
      };
    }
    
    // Basic validation passed
    return { valid: true };
  }

  /**
   * Helper method to log collection progress
   * @param source The data source being collected
   * @param message The progress message
   * @param meta Optional metadata
   */
  protected logProgress(source: DataSource, message: string, meta?: any): void {
    logger.info('collection', `[${source.name}] ${message}`, meta);
  }

  /**
   * Helper method to log collection errors
   * @param source The data source being collected
   * @param message The error message
   * @param error The error object
   */
  protected logError(source: DataSource, message: string, error?: any): void {
    logger.error('collection', `[${source.name}] ${message}`, error);
  }
} 