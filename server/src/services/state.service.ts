import { State, IState } from '../models/state.model';
import { County } from '../models/county.model';
import { StateObject, StateStatistics } from '../types/inventory';
import mongoose from 'mongoose';

export class StateService {
  /**
   * Get all states with filtered fields
   */
  async getAllStates(includeGeometry = false): Promise<IState[]> {
    const fields = 'name abbreviation metadata.totalCounties metadata.totalProperties metadata.statistics';
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
    const fields = 'name metadata.totalProperties metadata.statistics';
    
    const query = County.find({ parentId: id });
    return includeGeometry
      ? query.select(`${fields} geometry`).exec()
      : query.select(fields).exec();
  }

  /**
   * Get statistics for a state
   */
  async getStateStatistics(id: string): Promise<StateStatistics> {
    const state = await State.findById(id)
      .select('metadata.statistics')
      .exec();

    if (!state) {
      throw new Error('State not found');
    }

    return state.metadata.statistics;
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

    state.metadata.statistics = {
      ...state.metadata.statistics,
      ...statistics,
      lastUpdated: new Date()
    };

    return state.save();
  }
  
  /**
   * Recalculate and update state statistics based on child counties
   */
  async recalculateStateStatistics(stateId: string): Promise<IState | null> {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Get all counties for this state
      const counties = await County.find({ parentId: stateId }).session(session);
      
      // Calculate aggregated statistics
      const totalProperties = counties.reduce((sum, county) => sum + county.metadata.totalProperties, 0);
      const totalTaxLiens = counties.reduce((sum, county) => sum + county.metadata.statistics.totalTaxLiens, 0);
      const totalValue = counties.reduce((sum, county) => sum + county.metadata.statistics.totalValue, 0);
      const totalPropertiesWithLiens = counties.reduce(
        (sum, county) => sum + (county.metadata.statistics.totalPropertiesWithLiens || 0), 
        0
      );
      
      // Calculate average property value (if there are properties)
      const averagePropertyValue = totalProperties > 0 ? totalValue / totalProperties : 0;
      
      // Update the state with new statistics
      const updatedState = await State.findByIdAndUpdate(
        stateId,
        {
          $set: {
            'metadata.totalCounties': counties.length,
            'metadata.totalProperties': totalProperties,
            'metadata.statistics': {
              totalTaxLiens,
              totalValue,
              averagePropertyValue,
              totalPropertiesWithLiens,
              lastUpdated: new Date()
            }
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