import { State, IState } from '../models/state.model';
import { StateObject, StateStatistics } from '../types/inventory';

export class StateService {
  /**
   * Get all states
   */
  async getAllStates(): Promise<IState[]> {
    return State.find().populate('counties').exec();
  }

  /**
   * Get a state by ID
   */
  async getStateById(id: string): Promise<IState | null> {
    return State.findById(id).populate('counties').exec();
  }

  /**
   * Create a new state
   */
  async createState(stateData: Omit<StateObject, '_id'>): Promise<IState> {
    const state = new State(stateData);
    return state.save();
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
   * Delete a state
   */
  async deleteState(id: string): Promise<boolean> {
    const result = await State.findByIdAndDelete(id).exec();
    return result !== null;
  }

  /**
   * Get counties for a state
   */
  async getStateCounties(id: string): Promise<IState['counties']> {
    const state = await State.findById(id)
      .populate('counties')
      .select('counties')
      .exec();

    if (!state) {
      throw new Error('State not found');
    }

    return state.counties;
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
  async getStateControllers(id: string): Promise<IState['controllers']> {
    const state = await State.findById(id)
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
} 