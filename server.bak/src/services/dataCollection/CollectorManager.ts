import { DataCollector, DataSource, CollectionResult, CollectorManagerConfig } from './types';

/**
 * Default configuration for collector manager
 */
const DEFAULT_CONFIG: CollectorManagerConfig = {
  rateLimitDelay: 1000, // 1 second delay between collections
  maxConcurrentCollections: 3,
  logLevel: 'info'
};

/**
 * Manager for data collectors
 * Handles registration, scheduling, and execution of collectors
 */
export class CollectorManager {
  private collectors: Map<string, DataCollector> = new Map();
  private config: CollectorManagerConfig;
  private activeCollections: number = 0;

  /**
   * Create a new collector manager
   * @param config Optional configuration
   */
  constructor(config: Partial<CollectorManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Register a collector with the manager
   * @param collector The collector to register
   */
  registerCollector(collector: DataCollector): void {
    const type = collector.getType();
    if (this.collectors.has(type)) {
      console.warn(`Collector type '${type}' is already registered. Overwriting.`);
    }
    this.collectors.set(type, collector);
    console.info(`Registered collector: ${type}`);
  }

  /**
   * Get a collector by type
   * @param type The collector type
   */
  getCollector(type: string): DataCollector | undefined {
    return this.collectors.get(type);
  }

  /**
   * Get all registered collectors
   */
  getAllCollectors(): DataCollector[] {
    return Array.from(this.collectors.values());
  }

  /**
   * Initialize all collectors
   */
  async initializeAllCollectors(): Promise<void> {
    console.info('Initializing all collectors...');
    const collectors = this.getAllCollectors();
    
    // Initialize each collector sequentially
    for (const collector of collectors) {
      try {
        await collector.initialize();
        console.info(`Initialized collector: ${collector.getType()}`);
      } catch (error) {
        console.error(`Failed to initialize collector ${collector.getType()}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    console.info('All collectors initialized');
  }

  /**
   * Execute collection for a specific source
   * @param source The data source to collect from
   */
  async executeCollection(source: DataSource): Promise<CollectionResult> {
    const collector = this.getCollector(source.collectorType);
    
    if (!collector) {
      return {
        success: false,
        message: `No collector found for type: ${source.collectorType}`,
        timestamp: new Date(),
        sourceId: source.id
      };
    }
    
    if (!collector.isAvailable()) {
      return {
        success: false,
        message: `Collector ${source.collectorType} is not available`,
        timestamp: new Date(),
        sourceId: source.id
      };
    }
    
    // Wait for rate limit if active collections
    if (this.activeCollections > 0) {
      await new Promise(resolve => setTimeout(resolve, this.config.rateLimitDelay));
    }
    
    // Wait if at max concurrent collections
    while (this.activeCollections >= this.config.maxConcurrentCollections) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    try {
      this.activeCollections++;
      console.info(`Executing collection for source: ${source.name} (${source.id})`);
      
      const result = await collector.collect(source);
      
      console.info(`Collection ${result.success ? 'succeeded' : 'failed'} for source: ${source.name} (${source.id})`);
      return result;
    } catch (error) {
      console.error(`Error during collection for source ${source.id}: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        message: `Collection error: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date(),
        sourceId: source.id
      };
    } finally {
      this.activeCollections--;
    }
  }

  /**
   * Execute collection for multiple sources
   * @param sources Array of data sources to collect from
   */
  async executeCollections(sources: DataSource[]): Promise<CollectionResult[]> {
    return Promise.all(sources.map(source => this.executeCollection(source)));
  }
} 