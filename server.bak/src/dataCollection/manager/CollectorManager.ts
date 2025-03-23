import { BaseCollector } from '../collectors/BaseCollector';
import { ICollection } from '../../models/Collection';
import { IDataSource } from '../../models/DataSource';
import DataSource from '../../models/DataSource';
import Collection from '../../models/Collection';
import Property from '../../models/Property';
import mongoose from 'mongoose';

export interface HealthCheckResult {
  healthy: boolean;
  status: 'healthy' | 'degraded' | 'unhealthy';
  issues: Array<{
    type: 'source' | 'collection' | 'system';
    id: string;
    name?: string;
    message: string;
    timestamp?: Date;
    severity: 'warning' | 'error' | 'critical';
  }>;
  lastChecked: Date;
  collectors: {
    total: number;
    active: number;
  };
  sources: {
    total: number;
    active: number;
    warning: number;
    error: number;
  };
  recentCollections: {
    total: number;
    successful: number;
    failed: number;
  }
}

export class CollectorManager {
  private collectors: Map<string, BaseCollector>;
  
  constructor() {
    this.collectors = new Map();
  }
  
  registerCollector(name: string, collector: BaseCollector): void {
    this.collectors.set(name, collector);
  }
  
  async runCollection(collectorName: string): Promise<any> {
    const collector = this.collectors.get(collectorName);
    if (!collector) {
      throw new Error(`Collector ${collectorName} not found`);
    }
    
    try {
      console.log(`Starting collection with ${collectorName}`);
      
      const authenticated = await collector.authenticate();
      if (!authenticated) {
        throw new Error(`Authentication failed for ${collectorName}`);
      }
      
      const result = await collector.collect();
      
      // If collection was successful, save the results to the database
      if (result.success && result.data.length > 0) {
        await this.savePropertiesToDatabase(result.data, collectorName);
      }
      
      return result;
    } catch (error) {
      console.error(`Error running collector ${collectorName}:`, error);
      throw error;
    }
  }
  
  async runAllCollectors(): Promise<Map<string, any>> {
    const results = new Map();
    
    for (const [name, collector] of this.collectors.entries()) {
      try {
        const result = await this.runCollection(name);
        results.set(name, result);
      } catch (error) {
        console.error(`Failed to run collector ${name}:`, error);
        results.set(name, { success: false, error: error.message });
      }
    }
    
    return results;
  }
  
  private async savePropertiesToDatabase(properties: any[], sourceName: string): Promise<void> {
    console.log(`Saving ${properties.length} properties to database from ${sourceName}`);
    
    let newCount = 0;
    let updateCount = 0;
    
    for (const propertyData of properties) {
      try {
        // Use findOneAndUpdate with upsert to either update existing or create new
        const query = {};
        
        // Build query based on available identifiers, in order of preference
        if (propertyData.parcelId) {
          query['parcelId'] = propertyData.parcelId;
        } else if (propertyData.taxAccountNumber) {
          query['taxAccountNumber'] = propertyData.taxAccountNumber;
        } else {
          // If no ID fields, use address and county as a composite key
          query['propertyAddress'] = propertyData.propertyAddress;
          query['county'] = propertyData.county;
          query['state'] = propertyData.state;
        }
        
        const result = await Property.findOneAndUpdate(
          query,
          { $set: { ...propertyData, lastUpdated: new Date() } },
          { new: true, upsert: true }
        );
        
        if (result.isNew) {
          newCount++;
        } else {
          updateCount++;
        }
      } catch (error) {
        console.error('Error saving property:', error);
      }
    }
    
    console.log(`Database update complete: ${newCount} new properties, ${updateCount} updated properties`);
  }
  
  /**
   * Checks the health of the data collection system
   * Includes checks for sources, collectors, and recent collection runs
   * @param lookbackPeriod Number of hours to look back for recent collections
   * @returns Health check result object
   */
  async checkHealth(lookbackPeriod: number = 24): Promise<HealthCheckResult> {
    const issues = [];
    const now = new Date();
    const lookbackDate = new Date(now.getTime() - (lookbackPeriod * 60 * 60 * 1000));
    
    // Get all data sources
    const dataSources = await DataSource.find();
    
    // Count active and inactive sources
    const activeSources = dataSources.filter(s => s.status === 'active');
    const warningSources = dataSources.filter(s => s.status === 'warning');
    const errorSources = dataSources.filter(s => s.status === 'error');
    
    // Check for sources with errors
    for (const source of errorSources) {
      issues.push({
        type: 'source',
        id: source._id.toString(),
        name: source.name,
        message: source.metadata?.errorMessage || 'Source is in error state',
        timestamp: source.lastCollected,
        severity: 'error'
      });
    }
    
    // Check for sources with warnings
    for (const source of warningSources) {
      issues.push({
        type: 'source',
        id: source._id.toString(),
        name: source.name,
        message: source.metadata?.warningMessage || 'Source has warnings',
        timestamp: source.lastCollected,
        severity: 'warning'
      });
    }
    
    // Check for sources not collected recently
    const staleThreshold = 7; // 7 days
    for (const source of activeSources) {
      if (source.schedule?.frequency !== 'manual') {
        const lastCollected = source.lastCollected || new Date(0);
        const daysSinceCollection = (now.getTime() - lastCollected.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSinceCollection > staleThreshold) {
          issues.push({
            type: 'source',
            id: source._id.toString(),
            name: source.name,
            message: `Source hasn't been collected in ${Math.round(daysSinceCollection)} days`,
            timestamp: lastCollected,
            severity: 'warning'
          });
        }
      }
    }
    
    // Get recent collections
    const recentCollections = await Collection.find({
      timestamp: { $gte: lookbackDate }
    });
    
    const successfulCollections = recentCollections.filter(c => c.status === 'success');
    const failedCollections = recentCollections.filter(c => c.status === 'error');
    
    // Check for failed collections
    for (const collection of failedCollections) {
      const source = dataSources.find(s => s._id.toString() === collection.sourceId.toString());
      issues.push({
        type: 'collection',
        id: collection._id.toString(),
        name: source?.name || 'Unknown source',
        message: collection.errorLog[0]?.message || 'Collection failed',
        timestamp: collection.timestamp,
        severity: 'error'
      });
    }
    
    // Determine overall health status
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    const errorIssues = issues.filter(i => i.severity === 'error').length;
    const warningIssues = issues.filter(i => i.severity === 'warning').length;
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (criticalIssues > 0) {
      status = 'unhealthy';
    } else if (errorIssues > 0) {
      status = 'degraded';
    } else if (warningIssues > 0 && warningIssues > dataSources.length * 0.2) {
      // If more than 20% of sources have warnings
      status = 'degraded';
    }
    
    return {
      healthy: status === 'healthy',
      status,
      issues,
      lastChecked: now,
      collectors: {
        total: this.collectors.size,
        active: this.collectors.size // Assuming all registered collectors are active
      },
      sources: {
        total: dataSources.length,
        active: activeSources.length,
        warning: warningSources.length,
        error: errorSources.length
      },
      recentCollections: {
        total: recentCollections.length,
        successful: successfulCollections.length,
        failed: failedCollections.length
      }
    };
  }
  
  /**
   * Executes collection for multiple sources in parallel with a concurrency limit
   * @param sourceIds IDs of sources to collect, or all active sources if not specified
   * @param concurrencyLimit Maximum number of parallel collections
   * @returns Map of source IDs to collection results
   */
  async executeParallelCollections(sourceIds?: string[], concurrencyLimit = 3): Promise<Map<string, any>> {
    // Get the list of sources to process
    let sourcesToProcess: string[] = [];
    
    if (sourceIds && sourceIds.length > 0) {
      sourcesToProcess = sourceIds;
    } else {
      // If no source IDs provided, get all active sources
      const activeSources = await DataSource.find({ status: 'active' });
      sourcesToProcess = activeSources.map(s => s._id.toString());
    }
    
    const results = new Map<string, any>();
    const batches: string[][] = [];
    
    // Create batches of sources to process in parallel
    for (let i = 0; i < sourcesToProcess.length; i += concurrencyLimit) {
      batches.push(sourcesToProcess.slice(i, i + concurrencyLimit));
    }
    
    // Process each batch in parallel
    for (const batch of batches) {
      const batchPromises = batch.map(sourceId => {
        // Find the appropriate collector for this source
        return DataSource.findById(sourceId)
          .then(source => {
            if (!source) {
              throw new Error(`Source with ID ${sourceId} not found`);
            }
            
            const collectorName = source.collectorType;
            return this.runCollection(collectorName)
              .then(result => {
                results.set(sourceId, result);
                return result;
              })
              .catch(error => {
                const errorResult = {
                  sourceId,
                  timestamp: new Date(),
                  success: false,
                  message: error.message
                };
                results.set(sourceId, errorResult);
                return errorResult;
              });
          })
          .catch(error => {
            console.error(`Error processing source ${sourceId}:`, error);
            results.set(sourceId, {
              sourceId,
              timestamp: new Date(),
              success: false,
              message: error.message
            });
          });
      });
      
      // Wait for all promises in this batch to complete
      await Promise.all(batchPromises);
    }
    
    return results;
  }
} 