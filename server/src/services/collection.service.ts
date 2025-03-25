import { Collection, ICollection } from '../models/collection.model';
import { DataSource } from '../models/datasource.model';
import { CollectionObject, CollectionExecutionRequest, CollectionExecutionHistory } from '../types/inventory';
import { v4 as uuidv4 } from 'uuid';

export class CollectionService {
  /**
   * Get all collections
   */
  async getAllCollections(): Promise<ICollection[]> {
    return Collection.find().exec();
  }

  /**
   * Get a collection by ID
   */
  async getCollectionById(id: string): Promise<ICollection | null> {
    return Collection.findById(id).exec();
  }

  /**
   * Get collections by source ID
   */
  async getCollectionsBySource(sourceId: string): Promise<ICollection[]> {
    return Collection.find({ sourceId }).exec();
  }

  /**
   * Create a new collection
   */
  async createCollection(collectionData: Omit<CollectionObject, '_id'>): Promise<ICollection> {
    // Verify data source exists
    const dataSource = await DataSource.findById(collectionData.sourceId);
    if (!dataSource) {
      throw new Error('Data source not found');
    }

    const collection = new Collection(collectionData);
    return collection.save();
  }

  /**
   * Update a collection
   */
  async updateCollection(id: string, collectionData: Partial<CollectionObject>): Promise<ICollection | null> {
    // If sourceId is being updated, verify it exists
    if (collectionData.sourceId) {
      const dataSource = await DataSource.findById(collectionData.sourceId);
      if (!dataSource) {
        throw new Error('Data source not found');
      }
    }

    return Collection.findByIdAndUpdate(
      id,
      { $set: collectionData },
      { new: true, runValidators: true }
    ).exec();
  }

  /**
   * Delete a collection
   */
  async deleteCollection(id: string): Promise<boolean> {
    const result = await Collection.findByIdAndDelete(id).exec();
    return result !== null;
  }

  /**
   * Execute a collection
   */
  async executeCollection(id: string, request: CollectionExecutionRequest): Promise<ICollection> {
    const collection = await Collection.findById(id);
    
    if (!collection) {
      throw new Error('Collection not found');
    }

    if (!collection.enabled) {
      throw new Error('Collection is disabled');
    }

    // Verify data source is active
    const dataSource = await DataSource.findById(collection.sourceId);
    if (!dataSource) {
      throw new Error('Data source not found');
    }

    if (dataSource.status !== 'Active') {
      throw new Error('Data source is not active');
    }

    // Create execution history entry
    const executionId = uuidv4();
    const historyEntry: CollectionExecutionHistory = {
      id: executionId,
      timestamp: new Date(),
      status: 'In Progress',
      result: {
        recordsProcessed: 0,
        recordsCreated: 0,
        recordsUpdated: 0,
        recordsFailed: 0
      }
    };

    // Add to history
    collection.executionHistory.push(historyEntry);
    collection.lastRun = new Date();
    collection.status = 'Running';

    try {
      // TODO: Implement actual collection execution logic
      // This is a placeholder for the actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update execution history
      const executionIndex = collection.executionHistory.findIndex(h => h.id === executionId);
      if (executionIndex !== -1) {
        collection.executionHistory[executionIndex] = {
          ...collection.executionHistory[executionIndex],
          status: 'Success',
          duration: Date.now() - collection.executionHistory[executionIndex].timestamp.getTime(),
          result: {
            recordsProcessed: 100,
            recordsCreated: 80,
            recordsUpdated: 15,
            recordsFailed: 5
          }
        };
      }

      collection.status = 'Active';
      return collection.save();
    } catch (error: any) {
      // Update execution history with error
      const executionIndex = collection.executionHistory.findIndex(h => h.id === executionId);
      if (executionIndex !== -1) {
        collection.executionHistory[executionIndex] = {
          ...collection.executionHistory[executionIndex],
          status: 'Failed',
          duration: Date.now() - collection.executionHistory[executionIndex].timestamp.getTime(),
          error: error.message
        };
      }

      collection.status = 'Error';
      collection.error = error.message;
      await collection.save();
      throw error;
    }
  }

  /**
   * Get execution history for a collection
   */
  async getExecutionHistory(id: string): Promise<CollectionExecutionHistory[]> {
    const collection = await Collection.findById(id)
      .select('executionHistory')
      .exec();

    if (!collection) {
      throw new Error('Collection not found');
    }

    return collection.executionHistory;
  }

  /**
   * Get collection status
   */
  async getStatus(id: string): Promise<{ status: string; error?: string }> {
    const collection = await Collection.findById(id)
      .select('status error')
      .exec();

    if (!collection) {
      throw new Error('Collection not found');
    }

    return {
      status: collection.status,
      error: collection.error
    };
  }

  /**
   * Update collection status
   */
  async updateStatus(id: string, status: 'Active' | 'Inactive' | 'Error' | 'Running', error?: string): Promise<ICollection> {
    const collection = await Collection.findById(id);
    
    if (!collection) {
      throw new Error('Collection not found');
    }

    collection.status = status;
    if (error) {
      collection.error = error;
    } else {
      collection.error = undefined;
    }

    return collection.save();
  }
} 