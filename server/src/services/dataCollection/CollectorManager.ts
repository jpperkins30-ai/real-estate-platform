import { EventEmitter } from 'events';
import { logger } from '../../utils/collectorLogger';
import { CollectorDefinition, DataSource, CollectionResult } from '../../types/collector';
import { DataSource as DataSourceModel } from '../../models/datasource.model';
import CollectionModel from '../../models/Collection';

/**
 * Manages the data collection process
 * Central orchestrator for collector implementations
 */
export class CollectorManager extends EventEmitter {
  private collectors: Map<string, CollectorDefinition> = new Map();
  private sources: DataSource[] = [];
  private isInitialized: boolean = false;

  constructor() {
    super();
  }

  /**
   * Initialize the collector system
   * Loads active data sources from the database
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load sources from database
      const dataSources = await DataSourceModel.find({ status: 'active' });
      this.sources = dataSources.map(source => ({
        id: source._id.toString(),
        name: source.name,
        type: source.type,
        url: source.url,
        region: source.region,
        collectorType: source.collectorType,
        schedule: source.schedule,
        metadata: source.metadata,
        lastCollected: source.lastCollected,
        status: source.status,
        errorMessage: source.errorMessage
      }));
      
      logger.info('collection', `Loaded ${this.sources.length} active data sources`);
      this.isInitialized = true;
      this.emit('initialized', { sourcesCount: this.sources.length });
    } catch (error) {
      logger.error('collection', 'Failed to initialize collector manager', error);
      throw error;
    }
  }

  /**
   * Register a collector implementation
   * @param collector The collector to register
   * @returns This instance for method chaining
   */
  registerCollector(collector: CollectorDefinition): CollectorManager {
    if (this.collectors.has(collector.id)) {
      throw new Error(`Collector with ID ${collector.id} is already registered`);
    }
    
    this.collectors.set(collector.id, collector);
    logger.info('collection', `Registered collector: ${collector.name} (${collector.id})`);
    this.emit('collectorRegistered', { collectorId: collector.id });
    
    return this;
  }

  /**
   * Add a new data source
   * @param source The data source to add (without ID)
   * @returns The ID of the newly created source
   */
  async addSource(source: Omit<DataSource, 'id'>): Promise<string> {
    try {
      // Create the source in the database
      const newSource = await DataSourceModel.create(source);
      
      // Add to local cache
      const sourceWithId = {
        id: newSource._id.toString(),
        ...source
      };
      
      this.sources.push(sourceWithId);
      
      logger.info('collection', `Added new data source: ${source.name}`);
      this.emit('sourceAdded', { sourceId: newSource._id.toString() });
      
      return newSource._id.toString();
    } catch (error) {
      logger.error('collection', 'Failed to add data source', error);
      throw error;
    }
  }

  /**
   * Execute collection for a specific source
   * @param sourceId The ID of the source to collect
   * @returns Collection result with success/failure information
   */
  async executeCollection(sourceId: string): Promise<CollectionResult> {
    // Find the source
    const source = this.sources.find(s => s.id === sourceId);
    
    if (!source) {
      throw new Error(`Data source with ID ${sourceId} not found`);
    }
    
    // Find the appropriate collector
    const collector = this.collectors.get(source.collectorType);
    
    if (!collector) {
      throw new Error(`Collector type ${source.collectorType} not found`);
    }
    
    try {
      logger.info('collection', `Starting collection for source: ${source.name} (${source.id})`);
      this.emit('collectionStarted', { sourceId });
      
      // Start time for calculating duration
      const startTime = Date.now();
      
      // Execute the collector
      const result = await collector.execute(source);
      
      // Calculate duration
      const duration = Date.now() - startTime;
      
      // Update source with last collection timestamp and status
      await DataSourceModel.findByIdAndUpdate(sourceId, {
        lastCollected: new Date(),
        status: result.success ? 'active' : 'error',
        errorMessage: result.success ? null : result.message
      });
      
      // Update local cache
      const sourceIndex = this.sources.findIndex(s => s.id === sourceId);
      if (sourceIndex >= 0) {
        this.sources[sourceIndex] = {
          ...this.sources[sourceIndex],
          lastCollected: new Date(),
          status: result.success ? 'active' : 'error',
          errorMessage: result.success ? undefined : result.message
        };
      }
      
      // Record the collection result
      await CollectionModel.create({
        sourceId,
        timestamp: new Date(),
        status: result.success ? 'success' : 'error',
        stats: {
          duration,
          itemCount: result.data?.length || 0,
          successCount: result.success ? (result.data?.length || 0) : 0,
          errorCount: result.success ? 0 : 1
        },
        errorLog: result.success ? [] : [{ 
          message: result.message || 'Unknown error', 
          timestamp: new Date() 
        }],
        properties: result.data || []
      });
      
      logger.info('collection', `Completed collection for source: ${source.name} (${source.id}) in ${duration}ms`);
      this.emit('collectionCompleted', { 
        sourceId, 
        success: result.success,
        stats: {
          duration,
          itemCount: result.data?.length || 0
        }
      });
      
      return result;
    } catch (error) {
      logger.error('collection', `Collection failed for source: ${source.name} (${source.id})`, error);
      
      // Update source with error status
      await DataSourceModel.findByIdAndUpdate(sourceId, {
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Update local cache
      const sourceIndex = this.sources.findIndex(s => s.id === sourceId);
      if (sourceIndex >= 0) {
        this.sources[sourceIndex] = {
          ...this.sources[sourceIndex],
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        };
      }
      
      // Record the collection error
      await CollectionModel.create({
        sourceId,
        timestamp: new Date(),
        status: 'error',
        stats: {
          duration: 0,
          itemCount: 0,
          successCount: 0,
          errorCount: 1
        },
        errorLog: [{ 
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date(),
          stackTrace: error instanceof Error ? error.stack : undefined
        }],
        properties: []
      });
      
      this.emit('collectionError', { 
        sourceId, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      
      return {
        sourceId,
        timestamp: new Date(),
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get all registered collectors
   * @returns Array of collector definitions
   */
  getCollectors(): CollectorDefinition[] {
    return Array.from(this.collectors.values());
  }

  /**
   * Get all data sources
   * @returns Array of data sources
   */
  getSources(): DataSource[] {
    return [...this.sources];
  }
}

// Export singleton instance
export const collectorManager = new CollectorManager(); 