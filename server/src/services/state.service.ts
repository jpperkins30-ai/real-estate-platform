import { State, IState } from '../models/state.model';
import { County } from '../models/county.model';
import { StateObject, StateStatistics } from '../types/inventory';
import mongoose from 'mongoose';

export class StateService {
  /**
   * Get all states with filtered fields
   */
  async getAllStates(includeGeometry = false): Promise<IState[]> {
    const fields = 'name abbreviation totalCounties totalProperties stats';
    return includeGeometry 
      ? State.find().select(`${fields} geometry`).exec()
      : State.find().select(fields).exec();
  }

  /**
   * Get a state by ID with populated controllers
   */
  async getStateById(id: string): Promise<IState | null> {
    return State.findById(id)
      .populate({
        path: 'controllers.controllerId',
        select: 'name controllerType description'
      })
      .populate('counties')
      .exec();
  }

  /**
   * Create a new state with proper parent-child relationships
   */
  async createState(stateData: Omit<StateObject, '_id'>): Promise<IState> {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Create the state
      const state = new State(stateData);
      await state.save({ session });
      
      // Update the parent USMap document to include this state
      const USMap = mongoose.model('USMap');
      await USMap.findByIdAndUpdate(
        stateData.parentId,
        { 
          $push: { states: state._id },
          $inc: { 'metadata.totalStates': 1 }
        },
        { session }
      );
      
      await session.commitTransaction();
      return state;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Update a state
   */
  async updateState(id: string, stateData: Partial<StateObject>): Promise<IState | null> {
    return State.findByIdAndUpdate(
      id,
      { $set: stateData },
      { new: true, runValidators: true }
    ).exec();
  }

  /**
   * Delete a state with proper cleanup of relationships
   */
  async deleteState(id: string): Promise<boolean> {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Check if there are any child counties
      const childCountCount = await County.countDocuments({ parentId: id });
      
      if (childCountCount > 0) {
        throw new Error('Cannot delete state with counties. Delete all counties first.');
      }
      
      // Get the state to be deleted
      const state = await State.findById(id);
      
      if (!state) {
        return false;
      }
      
      // Update the parent USMap to remove this state
      const USMap = mongoose.model('USMap');
      await USMap.findByIdAndUpdate(
        state.parentId,
        { 
          $pull: { states: state._id },
          $inc: { 'metadata.totalStates': -1 }
        },
        { session }
      );
      
      // Delete the state
      await State.findByIdAndDelete(id).session(session);
      
      await session.commitTransaction();
      return true;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get counties for a state
   */
  async getStateCounties(id: string, includeGeometry = false): Promise<any[]> {
    const fields = 'name population propertyCount stats';
    
    const query = County.find({ stateId: id });
    return includeGeometry
      ? query.select(`${fields} geometry`).exec()
      : query.select(fields).exec();
  }

  /**
   * Get statistics for a state
   */
  async getStateStatistics(id: string): Promise<StateStatistics> {
    const state = await State.findById(id)
      .select('stats')
      .exec();

    if (!state) {
      throw new Error('State not found');
    }

    return state.stats;
  }

  /**
   * Get controllers for a state
   */
  async getStateControllers(id: string): Promise<any> {
    const state = await State.findById(id)
      .populate({
        path: 'controllers.controllerId',
        select: 'name controllerType description'
      })
      .select('controllers')
      .exec();

    if (!state) {
      throw new Error('State not found');
    }

    return state.controllers;
  }

  /**
   * Update state statistics
   */
  async updateStatistics(id: string, statistics: Partial<StateStatistics>): Promise<IState> {
    const state = await State.findById(id);
    
    if (!state) {
      throw new Error('State not found');
    }

    // Create update object for nested stats fields
    const updateData: any = {};
    
    // Update specific stats fields
    Object.keys(statistics).forEach(key => {
      if (key in state.stats) {
        updateData[`stats.${key}`] = statistics[key];
      }
    });
    
    // Update last updated timestamp
    updateData['stats.lastUpdated'] = new Date();

    // Apply updates
    return State.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).exec();
  }
  
  /**
   * Recalculate and update state statistics based on child counties
   */
  async recalculateStateStatistics(stateId: string): Promise<IState | null> {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Get all counties for this state
      const counties = await County.find({ stateId: stateId }).session(session);
      
      // Calculate aggregated statistics
      let totalProperties = 0;
      let totalTaxLiens = 0;
      let totalValue = 0;
      let totalPropertiesWithLiens = 0;
      let totalMedianHomeValue = 0;
      let countsWithMedianValues = 0;
      
      counties.forEach(county => {
        totalProperties += county.propertyCount || 0;
        totalTaxLiens += county.stats?.totalTaxLiens || 0;
        totalValue += county.stats?.totalValue || 0;
        totalPropertiesWithLiens += county.stats?.totalPropertiesWithLiens || 0;
        
        if (county.stats?.medianHomeValue > 0) {
          totalMedianHomeValue += county.stats.medianHomeValue;
          countsWithMedianValues++;
        }
      });
      
      // Calculate average property value (if there are properties)
      const averagePropertyValue = totalProperties > 0 ? totalValue / totalProperties : 0;
      
      // Calculate average median home value across counties
      const stateMedianHomeValue = countsWithMedianValues > 0 ? totalMedianHomeValue / countsWithMedianValues : 0;
      
      // Update the state with new statistics
      const updatedState = await State.findByIdAndUpdate(
        stateId,
        {
          $set: {
            'totalCounties': counties.length,
            'totalProperties': totalProperties,
            'stats.totalTaxLiens': totalTaxLiens,
            'stats.totalValue': totalValue,
            'stats.averagePropertyValue': averagePropertyValue,
            'stats.medianHomeValue': stateMedianHomeValue,
            'stats.lastUpdated': new Date()
          }
        },
        { new: true, session }
      );
      
      await session.commitTransaction();
      return updatedState;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
} 