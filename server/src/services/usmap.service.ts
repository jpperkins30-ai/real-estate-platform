import { USMap, IUSMap } from '../models/usmap.model';
import { USMapObject, USMapStatistics } from '../types/inventory';

export class USMapService {
  /**
   * Get the US Map object
   */
  async getUSMap(): Promise<IUSMap | null> {
    return USMap.findOne({ type: 'us_map' })
      .populate('states')
      .exec();
  }

  /**
   * Get US Map statistics
   */
  async getStatistics(): Promise<USMapStatistics> {
    const usMap = await USMap.findOne({ type: 'us_map' })
      .select('metadata.statistics')
      .exec();

    if (!usMap) {
      throw new Error('US Map not found');
    }

    return usMap.metadata.statistics;
  }

  /**
   * Get all states
   */
  async getStates(): Promise<IUSMap['states']> {
    const usMap = await USMap.findOne({ type: 'us_map' })
      .populate('states')
      .select('states')
      .exec();

    if (!usMap) {
      throw new Error('US Map not found');
    }

    return usMap.states;
  }

  /**
   * Update US Map statistics
   */
  async updateStatistics(statistics: Partial<USMapStatistics>): Promise<IUSMap> {
    const usMap = await USMap.findOne({ type: 'us_map' });
    
    if (!usMap) {
      throw new Error('US Map not found');
    }

    usMap.metadata.statistics = {
      ...usMap.metadata.statistics,
      ...statistics,
      lastUpdated: new Date()
    };

    return usMap.save();
  }
} 