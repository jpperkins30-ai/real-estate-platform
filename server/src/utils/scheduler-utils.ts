import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import logger from '../utils/logger';
import { DataSource, IDataSource } from '../models/datasource.model';
import { recordCollectionRun } from './collection-utils';

/**
 * Check if a data source is due for collection
 * 
 * @param dataSource - The data source to check
 * @returns Boolean indicating if the data source is due for collection
 */
export function isDataSourceDueForCollection(dataSource: IDataSource): boolean {
  // Skip if inactive
  if (dataSource.status === 'inactive') {
    return false;
  }
  
  const now = new Date();
  const lastCollected = dataSource.lastCollected || new Date(0);
  
  // For manual collection, never automatically trigger
  if (dataSource.schedule.frequency === 'manual') {
    return false;
  }
  
  // Calculate next collection time based on frequency
  let nextCollectionTime: Date;
  
  switch (dataSource.schedule.frequency) {
    case 'hourly':
      nextCollectionTime = new Date(lastCollected);
      nextCollectionTime.setHours(nextCollectionTime.getHours() + 1);
      break;
      
    case 'daily':
      nextCollectionTime = new Date(lastCollected);
      nextCollectionTime.setDate(nextCollectionTime.getDate() + 1);
      break;
      
    case 'weekly':
      nextCollectionTime = new Date(lastCollected);
      nextCollectionTime.setDate(nextCollectionTime.getDate() + 7);
      
      // If dayOfWeek is specified, adjust to that day
      if (dataSource.schedule.dayOfWeek !== undefined) {
        const dayDiff = dataSource.schedule.dayOfWeek - nextCollectionTime.getDay();
        if (dayDiff > 0) {
          nextCollectionTime.setDate(nextCollectionTime.getDate() + dayDiff);
        } else if (dayDiff < 0) {
          nextCollectionTime.setDate(nextCollectionTime.getDate() + 7 + dayDiff);
        }
      }
      break;
      
    case 'monthly':
      nextCollectionTime = new Date(lastCollected);
      nextCollectionTime.setMonth(nextCollectionTime.getMonth() + 1);
      
      // If dayOfMonth is specified, adjust to that day
      if (dataSource.schedule.dayOfMonth !== undefined) {
        nextCollectionTime.setDate(Math.min(
          dataSource.schedule.dayOfMonth,
          getDaysInMonth(nextCollectionTime.getFullYear(), nextCollectionTime.getMonth())
        ));
      }
      break;
      
    default:
      return false;
  }
  
  return now >= nextCollectionTime;
}

/**
 * Get the number of days in a month
 */
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Find all data sources that are due for collection
 * 
 * @returns Promise resolving to an array of data sources
 */
export async function findDueDataSources(): Promise<IDataSource[]> {
  try {
    // Get all active data sources
    const dataSources = await DataSource.find({ status: { $ne: 'inactive' } });
    
    // Filter for sources that are due for collection
    const dueSources = dataSources.filter(isDataSourceDueForCollection);
    
    logger.info(`Found ${dueSources.length} data sources due for collection out of ${dataSources.length} active sources`);
    
    return dueSources;
  } catch (error) {
    logger.error(`Error finding due data sources: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Schedule the next run for a data source
 * 
 * @param sourceId - ID of the data source
 * @param success - Whether the previous run was successful
 * @returns Promise resolving to the updated data source
 */
export async function scheduleNextRun(sourceId: string | ObjectId, success: boolean): Promise<IDataSource | null> {
  const sourceObjId = typeof sourceId === 'string' ? new ObjectId(sourceId) : sourceId;
  
  try {
    const dataSource = await DataSource.findById(sourceObjId);
    
    if (!dataSource) {
      logger.warn(`Data source not found: ${sourceId}`);
      return null;
    }
    
    // If the source is inactive or manual, don't schedule
    if (dataSource.schedule.frequency === 'manual' || dataSource.status === 'inactive') {
      return dataSource;
    }
    
    const now = new Date();
    let nextRunDate = new Date(now);
    
    // Calculate next run time based on frequency
    switch (dataSource.schedule.frequency) {
      case 'hourly':
        nextRunDate.setHours(nextRunDate.getHours() + 1);
        break;
        
      case 'daily':
        nextRunDate.setDate(nextRunDate.getDate() + 1);
        break;
        
      case 'weekly':
        // Add 7 days
        nextRunDate.setDate(nextRunDate.getDate() + 7);
        
        // If dayOfWeek is specified, adjust to that day
        if (dataSource.schedule.dayOfWeek !== undefined) {
          const dayDiff = dataSource.schedule.dayOfWeek - nextRunDate.getDay();
          if (dayDiff > 0) {
            nextRunDate.setDate(nextRunDate.getDate() + dayDiff);
          } else if (dayDiff < 0) {
            nextRunDate.setDate(nextRunDate.getDate() + 7 + dayDiff);
          }
        }
        break;
        
      case 'monthly':
        // Add 1 month
        nextRunDate.setMonth(nextRunDate.getMonth() + 1);
        
        // If dayOfMonth is specified, adjust to that day
        if (dataSource.schedule.dayOfMonth !== undefined) {
          nextRunDate.setDate(Math.min(
            dataSource.schedule.dayOfMonth,
            getDaysInMonth(nextRunDate.getFullYear(), nextRunDate.getMonth())
          ));
        }
        break;
    }
    
    // Update the next run date in the database
    const updatedSource = await DataSource.findByIdAndUpdate(
      sourceObjId,
      { 
        $set: { 
          nextScheduledRun: nextRunDate,
          // If collection failed, mark as error
          ...(success ? {} : { status: 'error' })
        } 
      },
      { new: true }
    );
    
    logger.info(`Scheduled next run for source ${sourceId} at ${nextRunDate}`);
    
    return updatedSource;
  } catch (error) {
    logger.error(`Error scheduling next run: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Run collections for all due data sources
 * 
 * @param collectorFn - Function to execute for each data source to collect data
 * @returns Promise resolving to an array of collection results
 */
export async function runScheduledCollections(
  collectorFn: (dataSource: IDataSource) => Promise<{
    properties: any[],
    duration: number,
    success: boolean,
    errorMessage?: string
  }>
): Promise<any[]> {
  try {
    // Find due data sources
    const dueSources = await findDueDataSources();
    
    if (dueSources.length === 0) {
      logger.info('No data sources due for collection');
      return [];
    }
    
    logger.info(`Running scheduled collections for ${dueSources.length} data sources`);
    
    // Process each data source
    const results = await Promise.all(dueSources.map(async (source) => {
      try {
        // Run collector
        const startTime = Date.now();
        logger.info(`Running collection for source: ${source.name} (${source._id})`);
        
        const collectionResult = await collectorFn(source);
        
        // Record the collection run
        const collectionId = await recordCollectionRun(
          source._id,
          collectionResult.properties,
          collectionResult.duration,
          collectionResult.success,
          collectionResult.errorMessage
        );
        
        // Schedule next run
        await scheduleNextRun(source._id, collectionResult.success);
        
        return {
          sourceId: source._id,
          sourceName: source.name,
          collectionId,
          success: collectionResult.success,
          propertyCount: collectionResult.properties.length,
          duration: collectionResult.duration
        };
      } catch (error) {
        logger.error(`Error processing data source ${source._id}: ${error instanceof Error ? error.message : String(error)}`);
        
        // Record the collection failure
        await recordCollectionRun(
          source._id,
          [],
          0,
          false,
          `Internal error: ${error instanceof Error ? error.message : String(error)}`
        );
        
        // Schedule next run regardless of failure
        await scheduleNextRun(source._id, false);
        
        return {
          sourceId: source._id,
          sourceName: source.name,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }));
    
    logger.info(`Completed scheduled collections: ${results.filter(r => r.success).length} succeeded, ${results.filter(r => !r.success).length} failed`);
    
    return results;
  } catch (error) {
    logger.error(`Error running scheduled collections: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
} 