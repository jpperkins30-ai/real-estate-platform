import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import logger from '../utils/logger';
import Collection from '../models/Collection';
import { DataSource, IDataSource } from '../models/datasource.model';

interface CollectionStats {
  duration: number;
  itemCount: number;
  successCount: number;
  errorCount: number;
  memoryUsage: number;
}

interface ErrorLogItem {
  message: string;
  timestamp: Date;
  details?: any;
}

/**
 * Records a data collection run and updates the associated data source
 * 
 * @param sourceId - ID of the data source that was collected
 * @param properties - Array of property IDs or property objects that were collected
 * @param duration - Duration of the collection run in milliseconds
 * @param success - Whether the collection was successful
 * @param errorDetails - Optional details if the collection failed
 * @returns Promise resolving to the created collection record ID
 */
export async function recordCollectionRun(
  sourceId: string | ObjectId,
  properties: (string | ObjectId | Record<string, any>)[],
  duration: number,
  success: boolean,
  errorDetails?: string
): Promise<string | ObjectId> {
  // Convert string ID to ObjectId if necessary
  const sourceObjId = typeof sourceId === 'string' ? new ObjectId(sourceId) : sourceId;
  
  // Extract property IDs from objects if needed
  const propertyIds = properties.map(p => {
    if (typeof p === 'string') return new ObjectId(p);
    if (p instanceof ObjectId) return p;
    return p._id instanceof ObjectId ? p._id : new ObjectId(p._id);
  });
  
  // Use a session to ensure operations are atomic
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Get data source to verify it exists
    const dataSource = await DataSource.findOne({ _id: sourceObjId }).session(session);
    
    if (!dataSource) {
      logger.warn(`Data source not found: ${sourceId}`);
      await session.abortTransaction();
      throw new Error(`Data source not found: ${sourceId}`);
    }
    
    // Prepare stats object
    const stats: CollectionStats = {
      duration: duration,
      itemCount: properties.length,
      successCount: success ? properties.length : 0,
      errorCount: success ? 0 : properties.length,
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024 // in MB
    };
    
    // Prepare error log
    const errorLog: ErrorLogItem[] = success ? [] : [
      { 
        message: errorDetails || "Collection failed", 
        timestamp: new Date(),
        details: errorDetails ? { error: errorDetails } : undefined
      }
    ];
    
    // Create collection record
    const collectionRecord = await Collection.create(
      [{
        sourceId: sourceObjId,
        timestamp: new Date(),
        status: success ? "success" : "error",
        stats: stats,
        errorLog: errorLog,
        properties: propertyIds,
        createdAt: new Date(),
        updatedAt: new Date()
      }],
      { session }
    );
    
    // Update data source
    await DataSource.updateOne(
      { _id: sourceObjId },
      {
        $set: {
          lastCollected: new Date(),
          status: success ? "active" : "error",
          errorMessage: success ? null : (errorDetails || "Collection failed")
        }
      },
      { session }
    );
    
    // Commit the transaction
    await session.commitTransaction();
    
    const collectionId = collectionRecord[0]._id;
    logger.info(`Collection run recorded: ${collectionId} for source: ${sourceId}, status: ${success ? "success" : "error"}`);
    
    return collectionId;
    
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    logger.error(`Error recording collection run: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
    
  } finally {
    // End session
    session.endSession();
  }
}

/**
 * Get the latest collection run for a data source
 * 
 * @param sourceId - ID of the data source
 * @returns Promise resolving to the latest collection or null if none exists
 */
export async function getLatestCollectionRun(sourceId: string | ObjectId) {
  const sourceObjId = typeof sourceId === 'string' ? new ObjectId(sourceId) : sourceId;
  
  try {
    return await Collection.findOne({ sourceId: sourceObjId })
      .sort({ timestamp: -1 })
      .limit(1);
  } catch (error) {
    logger.error(`Error getting latest collection run: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Get collection run statistics for a data source
 * 
 * @param sourceId - ID of the data source
 * @param limit - Number of collection runs to analyze (default: 10)
 * @returns Promise resolving to collection statistics
 */
export async function getCollectionRunStats(sourceId: string | ObjectId, limit = 10) {
  const sourceObjId = typeof sourceId === 'string' ? new ObjectId(sourceId) : sourceId;
  
  try {
    const collections = await Collection.find({ sourceId: sourceObjId })
      .sort({ timestamp: -1 })
      .limit(limit);
    
    const totalRuns = collections.length;
    if (totalRuns === 0) return null;
    
    const successRuns = collections.filter(c => c.status === 'success').length;
    const averageDuration = collections.reduce((sum, c) => sum + (c.stats?.duration || 0), 0) / totalRuns;
    const averageItems = collections.reduce((sum, c) => sum + (c.stats?.itemCount || 0), 0) / totalRuns;
    
    return {
      totalRuns,
      successRate: totalRuns > 0 ? (successRuns / totalRuns) * 100 : 0,
      averageDuration,
      averageItems,
      lastRun: collections[0]
    };
  } catch (error) {
    logger.error(`Error getting collection run stats: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
} 