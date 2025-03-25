import { County, ICounty } from '../models/county.model';
import { CountyObject, CountyStatistics, CountySearchConfig } from '../types/inventory';

export class CountyService {
  /**
   * Get all counties
   */
  async getAllCounties(): Promise<ICounty[]> {
    return County.find().populate('properties').exec();
  }

  /**
   * Get a county by ID
   */
  async getCountyById(id: string): Promise<ICounty | null> {
    return County.findById(id).populate('properties').exec();
  }

  /**
   * Create a new county
   */
  async createCounty(countyData: Omit<CountyObject, '_id'>): Promise<ICounty> {
    const county = new County(countyData);
    return county.save();
  }

  /**
   * Update a county
   */
  async updateCounty(id: string, countyData: Partial<CountyObject>): Promise<ICounty | null> {
    return County.findByIdAndUpdate(
      id,
      { $set: countyData },
      { new: true, runValidators: true }
    ).exec();
  }

  /**
   * Delete a county
   */
  async deleteCounty(id: string): Promise<boolean> {
    const result = await County.findByIdAndDelete(id).exec();
    return result !== null;
  }

  /**
   * Get properties for a county
   */
  async getCountyProperties(id: string): Promise<ICounty['properties']> {
    const county = await County.findById(id)
      .populate('properties')
      .select('properties')
      .exec();

    if (!county) {
      throw new Error('County not found');
    }

    return county.properties;
  }

  /**
   * Get statistics for a county
   */
  async getCountyStatistics(id: string): Promise<CountyStatistics> {
    const county = await County.findById(id)
      .select('metadata.statistics')
      .exec();

    if (!county) {
      throw new Error('County not found');
    }

    return county.metadata.statistics;
  }

  /**
   * Get controllers for a county
   */
  async getCountyControllers(id: string): Promise<ICounty['controllers']> {
    const county = await County.findById(id)
      .select('controllers')
      .exec();

    if (!county) {
      throw new Error('County not found');
    }

    return county.controllers;
  }

  /**
   * Get search configuration for a county
   */
  async getCountySearchConfig(id: string): Promise<CountySearchConfig> {
    const county = await County.findById(id)
      .select('searchConfig')
      .exec();

    if (!county) {
      throw new Error('County not found');
    }

    return county.searchConfig;
  }

  /**
   * Update search configuration for a county
   */
  async updateCountySearchConfig(id: string, searchConfig: Partial<CountySearchConfig>): Promise<ICounty> {
    const county = await County.findById(id);
    
    if (!county) {
      throw new Error('County not found');
    }

    county.searchConfig = {
      ...county.searchConfig,
      ...searchConfig
    };

    return county.save();
  }

  /**
   * Update county statistics
   */
  async updateStatistics(id: string, statistics: Partial<CountyStatistics>): Promise<ICounty> {
    const county = await County.findById(id);
    
    if (!county) {
      throw new Error('County not found');
    }

    county.metadata.statistics = {
      ...county.metadata.statistics,
      ...statistics,
      lastUpdated: new Date()
    };

    return county.save();
  }
} 