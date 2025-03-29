import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { Controller } from '../models/controller.model';
import { County } from '../models/county.model';
import logger from '../utils/logger';

/**
 * Attaches a controller to a county with specified configuration
 * 
 * @param controllerId - ID of the controller to attach
 * @param countyId - ID of the county to attach the controller to
 * @param configuration - Optional configuration for the controller
 * @returns Promise resolving to true if successful, false otherwise
 */
export async function attachControllerToCounty(
  controllerId: string | ObjectId, 
  countyId: string | ObjectId,
  configuration: Record<string, any> = {}
): Promise<boolean> {
  // Convert string IDs to ObjectIds if necessary
  const controllerObjId = typeof controllerId === 'string' ? new ObjectId(controllerId) : controllerId;
  const countyObjId = typeof countyId === 'string' ? new ObjectId(countyId) : countyId;
  
  // Use a session to ensure operations are atomic
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get controller
    const controller = await Controller.findOne({ _id: controllerObjId }).session(session);
    
    if (!controller) {
      logger.warn(`Controller not found: ${controllerId}`);
      await session.abortTransaction();
      return false;
    }
    
    // Get county
    const county = await County.findOne({ _id: countyObjId }).session(session);
    
    if (!county) {
      logger.warn(`County not found: ${countyId}`);
      await session.abortTransaction();
      return false;
    }
    
    // Update controller's attachedTo array
    await Controller.updateOne(
      { _id: controllerObjId },
      { 
        $addToSet: { 
          attachedTo: {
            objectId: countyObjId,
            objectType: "county"
          }
        }
      },
      { session }
    );
    
    // Update county's controllers array
    await County.updateOne(
      { _id: countyObjId },
      {
        $addToSet: {
          controllers: {
            controllerId: controllerObjId,
            controllerType: controller.controllerType,
            enabled: true,
            lastRun: null,
            nextScheduledRun: null,
            configuration: configuration
          }
        }
      },
      { session }
    );
    
    // Commit the transaction
    await session.commitTransaction();
    logger.info(`Controller ${controllerId} successfully attached to county ${countyId}`);
    return true;
    
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    logger.error(`Error attaching controller to county: ${error instanceof Error ? error.message : String(error)}`);
    return false;
    
  } finally {
    // End session
    session.endSession();
  }
}

/**
 * Detaches a controller from a county
 * 
 * @param controllerId - ID of the controller to detach
 * @param countyId - ID of the county to detach the controller from
 * @returns Promise resolving to true if successful, false otherwise
 */
export async function detachControllerFromCounty(
  controllerId: string | ObjectId, 
  countyId: string | ObjectId
): Promise<boolean> {
  // Convert string IDs to ObjectIds if necessary
  const controllerObjId = typeof controllerId === 'string' ? new ObjectId(controllerId) : controllerId;
  const countyObjId = typeof countyId === 'string' ? new ObjectId(countyId) : countyId;
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Remove county from controller's attachedTo array
    await Controller.updateOne(
      { _id: controllerObjId },
      { 
        $pull: { 
          attachedTo: {
            objectId: countyObjId,
            objectType: "county"
          }
        }
      },
      { session }
    );
    
    // Remove controller from county's controllers array
    await County.updateOne(
      { _id: countyObjId },
      {
        $pull: {
          controllers: {
            controllerId: controllerObjId
          }
        }
      },
      { session }
    );
    
    // Commit the transaction
    await session.commitTransaction();
    logger.info(`Controller ${controllerId} successfully detached from county ${countyId}`);
    return true;
    
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    logger.error(`Error detaching controller from county: ${error instanceof Error ? error.message : String(error)}`);
    return false;
    
  } finally {
    // End session
    session.endSession();
  }
} 