import { Request, Response } from 'express';
import { County } from '../models/County';

/**
 * Get all counties for a state
 */
export const getCountiesByState = async (req: Request, res: Response) => {
  try {
    const { stateId } = req.params;
    
    const counties = await County.find({ stateId })
      .select('name fips population propertyCount')
      .sort({ name: 1 });
    
    res.status(200).json(counties);
  } catch (error) {
    console.error(`Error fetching counties for state ${req.params.stateId}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get a specific county
 */
export const getCounty = async (req: Request, res: Response) => {
  try {
    const { countyId } = req.params;
    
    const county = await County.findOne({ _id: countyId });
    
    if (!county) {
      return res.status(404).json({ message: 'County not found' });
    }
    
    res.status(200).json(county);
  } catch (error) {
    console.error(`Error fetching county ${req.params.countyId}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get county boundaries (GeoJSON)
 */
export const getCountyBoundaries = async (req: Request, res: Response) => {
  try {
    const { countyId } = req.params;
    
    const county = await County.findOne({ _id: countyId })
      .select('boundaries');
    
    if (!county) {
      return res.status(404).json({ message: 'County not found' });
    }
    
    res.status(200).json(county.boundaries);
  } catch (error) {
    console.error(`Error fetching county boundaries ${req.params.countyId}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get county statistics
 */
export const getCountyStats = async (req: Request, res: Response) => {
  try {
    const { countyId } = req.params;
    
    const county = await County.findOne({ _id: countyId })
      .select('stats population propertyCount');
    
    if (!county) {
      return res.status(404).json({ message: 'County not found' });
    }
    
    // Create a new object with all the stats properties
    const statsResponse = {
      medianHomePrice: county.stats.medianHomePrice,
      avgDaysOnMarket: county.stats.avgDaysOnMarket,
      listingCount: county.stats.listingCount, 
      priceChangeYoY: county.stats.priceChangeYoY,
      lastUpdated: county.stats.lastUpdated,
      population: county.population,
      propertyCount: county.propertyCount
    };
    
    res.status(200).json(statsResponse);
  } catch (error) {
    console.error(`Error fetching county stats ${req.params.countyId}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get county controller status
 */
export const getCountyControllerStatus = async (req: Request, res: Response) => {
  try {
    const { countyId } = req.params;
    
    // This would connect to your controller system
    // For now, returning mock data
    const hasController = Math.random() > 0.5;
    
    let status = null;
    let lastRun = null;
    
    if (hasController) {
      const statuses = ['active', 'inactive', 'error'];
      status = statuses[Math.floor(Math.random() * statuses.length)];
      lastRun = new Date(Date.now() - Math.random() * 86400000 * 30).toISOString();
    }
    
    res.status(200).json({
      hasController,
      status,
      lastRun
    });
  } catch (error) {
    console.error(`Error fetching county controller status ${req.params.countyId}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
}; 