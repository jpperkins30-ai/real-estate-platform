import { Request, Response } from 'express';
import { County } from '../models/County';
import { Property } from '../models/Property';

/**
 * Get all counties
 */
export const getCounties = async (req: Request, res: Response) => {
  try {
    const { stateId, limit = 100, page = 1 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    // Build query
    const query: any = {};
    if (stateId) {
      query.stateId = stateId;
    }
    
    // Execute query with pagination
    const [counties, total] = await Promise.all([
      County.find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(Number(limit)),
      County.countDocuments(query)
    ]);
    
    res.status(200).json({
      counties,
      total,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error) {
    console.error('Error fetching counties:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get a specific county
 */
export const getCounty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const county = await County.findById(id);
    
    if (!county) {
      return res.status(404).json({ message: 'County not found' });
    }
    
    res.status(200).json(county);
  } catch (error) {
    console.error(`Error fetching county ${req.params.id}:`, error);
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
    const { id } = req.params;
    const { timeframe = '1y' } = req.query;
    
    // Check if county exists and get its stats
    const county = await County.findById(id).select('stats population propertyCount');
    
    if (!county) {
      return res.status(404).json({ message: 'County not found' });
    }
    
    // If we just want the stored stats without calculating from properties
    if (req.query.useStoredStats === 'true') {
      // Create a plain object with the stats properties
      const statsResponse = {
        medianHomeValue: county.stats.medianHomeValue,
        medianIncome: county.stats.medianIncome,
        unemploymentRate: county.stats.unemploymentRate,
        avgDaysOnMarket: county.stats.avgDaysOnMarket,
        listingCount: county.stats.listingCount,
        priceChangeYoY: county.stats.priceChangeYoY,
        lastUpdated: county.stats.lastUpdated,
        population: county.population,
        propertyCount: county.propertyCount
      };
      
      return res.status(200).json(statsResponse);
    }
    
    // Calculate date range based on timeframe
    const now = new Date();
    let startDate: Date;
    
    switch (timeframe) {
      case '1m':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case '3m':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case '6m':
        startDate = new Date(now.setMonth(now.getMonth() - 6));
        break;
      case '1y':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case '3y':
        startDate = new Date(now.setFullYear(now.getFullYear() - 3));
        break;
      case '5y':
        startDate = new Date(now.setFullYear(now.getFullYear() - 5));
        break;
      case 'all':
      default:
        startDate = new Date(0); // Beginning of time
        break;
    }
    
    // Get all properties in this county within the timeframe
    const properties = await Property.find({
      countyId: id,
      listDate: { $gte: startDate }
    });
    
    // Calculate statistics
    const stats = {
      propertyCount: properties.length,
      medianHomeValue: county.stats.medianHomeValue || 0,
      medianIncome: county.stats.medianIncome || 0,
      unemploymentRate: county.stats.unemploymentRate || 0,
      avgDaysOnMarket: county.stats.avgDaysOnMarket || 0,
      listingCount: properties.filter(p => p.status === 'active').length,
      priceChangeYoY: county.stats.priceChangeYoY || 0,
      population: county.population || 0,
      lastUpdated: new Date()
    };
    
    if (properties.length > 0) {
      // Calculate median home value if we have enough properties
      const sortedPrices = properties.map(p => p.price).sort((a, b) => a - b);
      const midIndex = Math.floor(sortedPrices.length / 2);
      stats.medianHomeValue = sortedPrices.length % 2 === 0
        ? Math.round((sortedPrices[midIndex - 1] + sortedPrices[midIndex]) / 2)
        : sortedPrices[midIndex];
      
      // Calculate days on market
      const totalDays = properties.reduce((sum, prop) => {
        const listDate = new Date(prop.listDate);
        const soldDate = prop.soldDate ? new Date(prop.soldDate) : new Date();
        const days = Math.round((soldDate.getTime() - listDate.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);
      stats.avgDaysOnMarket = Math.round(totalDays / properties.length);
    }
    
    // Save the updated stats to the county model
    if (req.query.updateCounty === 'true') {
      try {
        // Only update the stats that we calculated
        await County.findByIdAndUpdate(id, {
          $set: {
            'stats.medianHomeValue': stats.medianHomeValue,
            'stats.avgDaysOnMarket': stats.avgDaysOnMarket,
            'stats.listingCount': stats.listingCount,
            'stats.lastUpdated': stats.lastUpdated
          }
        });
      } catch (updateError) {
        console.error(`Error updating county stats: ${updateError}`);
      }
    }
    
    res.status(200).json(stats);
  } catch (error) {
    console.error(`Error fetching stats for county ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update county statistics
 */
export const updateCountyStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const statsUpdate = req.body;
    
    // Validate input
    if (!statsUpdate || typeof statsUpdate !== 'object') {
      return res.status(400).json({ message: 'Invalid statistics data' });
    }

    // Find the county
    const county = await County.findById(id);
    
    if (!county) {
      return res.status(404).json({ message: 'County not found' });
    }
    
    // Update only valid stats fields
    const validFields = [
      'medianHomeValue', 
      'medianIncome', 
      'unemploymentRate', 
      'avgDaysOnMarket', 
      'listingCount', 
      'priceChangeYoY'
    ];
    
    const updateData: any = {};
    
    validFields.forEach(field => {
      if (field in statsUpdate) {
        updateData[`stats.${field}`] = statsUpdate[field];
      }
    });
    
    // Add lastUpdated timestamp
    updateData['stats.lastUpdated'] = new Date();
    
    // Also update population and propertyCount if provided
    if ('population' in statsUpdate) {
      updateData.population = statsUpdate.population;
    }
    
    if ('propertyCount' in statsUpdate) {
      updateData.propertyCount = statsUpdate.propertyCount;
    }
    
    // Update the county
    const updatedCounty = await County.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      message: 'Statistics updated successfully',
      stats: updatedCounty?.stats,
      population: updatedCounty?.population,
      propertyCount: updatedCounty?.propertyCount
    });
  } catch (error) {
    console.error(`Error updating stats for county ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get county properties
 */
export const getCountyProperties = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      limit = 50, 
      page = 1, 
      sort = 'date_desc',
      propertyType,
      minPrice,
      maxPrice
    } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    // Check if county exists
    const county = await County.findById(id);
    
    if (!county) {
      return res.status(404).json({ message: 'County not found' });
    }
    
    // Build query
    const query: any = { countyId: id };
    
    // Apply filters
    if (propertyType) {
      query.propertyType = propertyType;
    }
    
    if (minPrice) {
      query.price = { ...query.price, $gte: Number(minPrice) };
    }
    
    if (maxPrice) {
      query.price = { ...query.price, $lte: Number(maxPrice) };
    }
    
    // Determine sort order
    let sortOptions = {};
    switch (sort) {
      case 'price_asc':
        sortOptions = { price: 1 };
        break;
      case 'price_desc':
        sortOptions = { price: -1 };
        break;
      case 'date_asc':
        sortOptions = { listDate: 1 };
        break;
      case 'date_desc':
      default:
        sortOptions = { listDate: -1 };
        break;
    }
    
    // Execute query with pagination
    const [properties, total] = await Promise.all([
      Property.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit)),
      Property.countDocuments(query)
    ]);
    
    res.status(200).json({
      properties,
      total,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error) {
    console.error(`Error fetching properties for county ${req.params.id}:`, error);
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