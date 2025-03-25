import { Controller, IController } from '../models/controller.model';
import { ControllerObject, ControllerObjectReference, ControllerExecutionRequest, ControllerExecutionHistory } from '../types/inventory';
import { v4 as uuidv4 } from 'uuid';

export class ControllerService {
  /**
   * Get all controllers
   */
  async getAllControllers(): Promise<IController[]> {
    return Controller.find().exec();
  }

  /**
   * Get a controller by ID
   */
  async getControllerById(id: string): Promise<IController | null> {
    return Controller.findById(id).exec();
  }

  /**
   * Create a new controller
   */
  async createController(controllerData: Omit<ControllerObject, '_id'>): Promise<IController> {
    const controller = new Controller(controllerData);
    return controller.save();
  }

  /**
   * Update a controller
   */
  async updateController(id: string, controllerData: Partial<ControllerObject>): Promise<IController | null> {
    return Controller.findByIdAndUpdate(
      id,
      { $set: controllerData },
      { new: true, runValidators: true }
    ).exec();
  }

  /**
   * Delete a controller
   */
  async deleteController(id: string): Promise<boolean> {
    const result = await Controller.findByIdAndDelete(id).exec();
    return result !== null;
  }

  /**
   * Get attached objects for a controller
   */
  async getAttachedObjects(id: string): Promise<ControllerObject['attachedObjects']> {
    const controller = await Controller.findById(id)
      .select('attachedObjects')
      .exec();

    if (!controller) {
      throw new Error('Controller not found');
    }

    return controller.attachedObjects;
  }

  /**
   * Attach objects to a controller
   */
  async attachObjects(id: string, objects: ControllerObjectReference[]): Promise<IController> {
    const controller = await Controller.findById(id);
    
    if (!controller) {
      throw new Error('Controller not found');
    }

    // Add new attachments
    const newAttachments = objects.map(obj => ({
      objectId: obj.objectId,
      objectType: obj.objectType,
      attachedAt: new Date()
    }));

    controller.attachedObjects = [
      ...controller.attachedObjects,
      ...newAttachments
    ];

    return controller.save();
  }

  /**
   * Detach objects from a controller
   */
  async detachObjects(id: string, objectIds: string[]): Promise<IController> {
    const controller = await Controller.findById(id);
    
    if (!controller) {
      throw new Error('Controller not found');
    }

    controller.attachedObjects = controller.attachedObjects.filter(
      attachment => !objectIds.includes(attachment.objectId)
    );

    return controller.save();
  }

  /**
   * Execute a controller
   */
  async executeController(id: string, request: ControllerExecutionRequest): Promise<IController> {
    const controller = await Controller.findById(id);
    
    if (!controller) {
      throw new Error('Controller not found');
    }

    if (!controller.enabled) {
      throw new Error('Controller is disabled');
    }

    // Create execution history entry
    const executionId = uuidv4();
    const historyEntry: ControllerExecutionHistory = {
      id: executionId,
      timestamp: new Date(),
      status: 'In Progress',
      metadata: {
        objectsProcessed: 0,
        objectsUpdated: 0,
        objectsFailed: 0
      }
    };

    // Add to history
    controller.executionHistory.push(historyEntry);
    controller.lastRun = new Date();

    try {
      // TODO: Implement actual controller execution logic
      // This is a placeholder for the actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update execution history
      const executionIndex = controller.executionHistory.findIndex(h => h.id === executionId);
      if (executionIndex !== -1) {
        controller.executionHistory[executionIndex] = {
          ...controller.executionHistory[executionIndex],
          status: 'Success',
          duration: Date.now() - controller.executionHistory[executionIndex].timestamp.getTime(),
          metadata: {
            objectsProcessed: 10,
            objectsUpdated: 8,
            objectsFailed: 2
          }
        };
      }

      return controller.save();
    } catch (error: any) {
      // Update execution history with error
      const executionIndex = controller.executionHistory.findIndex(h => h.id === executionId);
      if (executionIndex !== -1) {
        controller.executionHistory[executionIndex] = {
          ...controller.executionHistory[executionIndex],
          status: 'Failed',
          duration: Date.now() - controller.executionHistory[executionIndex].timestamp.getTime(),
          error: error.message
        };
      }

      await controller.save();
      throw error;
    }
  }

  /**
   * Get execution history for a controller
   */
  async getExecutionHistory(id: string): Promise<ControllerExecutionHistory[]> {
    const controller = await Controller.findById(id)
      .select('executionHistory')
      .exec();

    if (!controller) {
      throw new Error('Controller not found');
    }

    return controller.executionHistory;
  }
} 