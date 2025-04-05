import { Request, Response } from 'express';
import { LayoutConfig } from '../models/LayoutConfig';

/**
 * Get all layouts for the current user
 */
export const getLayouts = async (req: Request, res: Response) => {
  try {
    const { isPublic } = req.query;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const userId = req.user.id;
    
    // Build query
    const query: any = { userId };
    
    // Include public layouts if requested
    if (isPublic === 'true') {
      query.$or = [{ userId }, { isPublic: true }];
    }
    
    const layouts = await LayoutConfig.find(query).sort({ updatedAt: -1 });
    
    res.status(200).json(layouts);
  } catch (error) {
    console.error('Error fetching layouts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get a specific layout
 */
export const getLayout = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const userId = req.user.id;
    
    const layout = await LayoutConfig.findOne({
      _id: id,
      $or: [{ userId }, { isPublic: true }]
    });
    
    if (!layout) {
      return res.status(404).json({ message: 'Layout not found' });
    }
    
    res.status(200).json(layout);
  } catch (error) {
    console.error(`Error fetching layout ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create a new layout
 */
export const createLayout = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const userId = req.user.id;
    
    // Check if this is set as default
    if (req.body.isDefault) {
      // Unset any existing default layouts
      await LayoutConfig.updateMany(
        { userId, isDefault: true },
        { $set: { isDefault: false } }
      );
    }
    
    const layout = new LayoutConfig({
      ...req.body,
      userId
    });
    
    await layout.save();
    
    res.status(201).json(layout);
  } catch (error) {
    console.error('Error creating layout:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update a layout
 */
export const updateLayout = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const userId = req.user.id;
    
    // Find the layout
    const layout = await LayoutConfig.findOne({ _id: id, userId });
    
    if (!layout) {
      return res.status(404).json({ message: 'Layout not found' });
    }
    
    // Check if this is being set as default
    if (req.body.isDefault && !layout.isDefault) {
      // Unset any existing default layouts
      await LayoutConfig.updateMany(
        { userId, isDefault: true },
        { $set: { isDefault: false } }
      );
    }
    
    // Update the layout
    Object.entries(req.body).forEach(([key, value]) => {
      // @ts-ignore
      layout[key] = value;
    });
    
    await layout.save();
    
    res.status(200).json(layout);
  } catch (error) {
    console.error(`Error updating layout ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete a layout
 */
export const deleteLayout = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const userId = req.user.id;
    
    const layout = await LayoutConfig.findOneAndDelete({ _id: id, userId });
    
    if (!layout) {
      return res.status(404).json({ message: 'Layout not found' });
    }
    
    res.status(200).json({ message: 'Layout deleted successfully' });
  } catch (error) {
    console.error(`Error deleting layout ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Clone a layout
 */
export const cloneLayout = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const userId = req.user.id;
    
    // Find the source layout
    const sourceLayout = await LayoutConfig.findOne({
      _id: id,
      $or: [{ userId }, { isPublic: true }]
    });
    
    if (!sourceLayout) {
      return res.status(404).json({ message: 'Layout not found' });
    }
    
    // Create a new layout based on the source
    const sourceObj = sourceLayout.toObject();
    const newLayout = new LayoutConfig({
      ...sourceObj,
      _id: undefined, // Let MongoDB generate a new ID
      userId,
      name: name || `Copy of ${sourceLayout.name}`,
      isDefault: false, // Never set a clone as default
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await newLayout.save();
    
    res.status(201).json(newLayout);
  } catch (error) {
    console.error(`Error cloning layout ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
}; 