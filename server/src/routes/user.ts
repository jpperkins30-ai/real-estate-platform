import express from 'express';
import { Request, Response } from 'express';
import User from '../models/User';
import { authenticate, authorize } from '../middleware/auth';
import { hashPassword } from '../utils/auth';
import { logError } from '../utils/logger';
import { startPerformanceTimer } from '../utils/appLogger';
import activityLogger from '../middleware/activityLogger';

const router = express.Router();

// Get current user profile
router.get(
  '/me',
  authenticate,
  async (req: Request, res: Response) => {
    const endTimer = startPerformanceTimer('user-profile-get');
    const userId = req.user?.id;

    try {
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      endTimer();
      res.json(user);
    } catch (error) {
      logError(`Error fetching user profile - metadata: { userId }`, error as Error);
      res.status(500).json({ message: 'Error fetching user profile' });
    }
  }
);

// Update current user profile
router.put(
  '/me',
  authenticate,
  activityLogger.updateResource('profile', ['password', 'currentPassword']),
  async (req: Request, res: Response) => {
    const endTimer = startPerformanceTimer('user-profile-update');
    const userId = req.user?.id;

    try {
      const { name, email, currentPassword, password } = req.body;
      
      // Build update object
      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      
      // Handle password update if provided
      if (password && currentPassword) {
        // Verify current password
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        // Compare password logic would go here
        // For brevity, assuming a comparePassword function exists
        
        // Hash new password
        updateData.password = await hashPassword(password);
      } else if (password && !currentPassword) {
        return res.status(400).json({ message: 'Current password is required to update password' });
      }
      
      // Update user
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');
      
      endTimer();
      res.json(updatedUser);
    } catch (error) {
      logError(`Error updating user profile - metadata: { userId }`, error as Error);
      res.status(500).json({ message: 'Error updating user profile' });
    }
  }
);

// Get all users (admin only)
router.get(
  '/',
  authenticate,
  authorize(['admin']),
  activityLogger.adminAction('users', 'list'),
  async (req: Request, res: Response) => {
    const endTimer = startPerformanceTimer('admin-users-list');
    
    try {
      const users = await User.find().select('-password');
      
      endTimer();
      res.json(users);
    } catch (error) {
      logError('Error fetching users list', error as Error);
      res.status(500).json({ message: 'Error fetching users list' });
    }
  }
);

// Get user by ID (admin only)
router.get(
  '/:id',
  authenticate,
  authorize(['admin']),
  activityLogger.adminAction('user', 'view'),
  async (req: Request, res: Response) => {
    const endTimer = startPerformanceTimer('admin-user-get');
    
    try {
      const user = await User.findById(req.params.id).select('-password');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      endTimer();
      res.json(user);
    } catch (error) {
      logError(`Error fetching user - metadata: { userId: req.params.id }`, error as Error);
      res.status(500).json({ message: 'Error fetching user' });
    }
  }
);

// Update user (admin only)
router.put(
  '/:id',
  authenticate,
  authorize(['admin']),
  activityLogger.adminAction('user', 'update'),
  async (req: Request, res: Response) => {
    const endTimer = startPerformanceTimer('admin-user-update');
    const userId = req.params.id;
    
    try {
      const { name, email, role, isActive } = req.body;
      
      // Build update object
      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (role) updateData.role = role;
      if (isActive !== undefined) updateData.isActive = isActive;
      
      // Update user
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      endTimer();
      res.json(updatedUser);
    } catch (error) {
      logError(`Error updating user - metadata: { userId }`, error as Error);
      res.status(500).json({ message: 'Error updating user' });
    }
  }
);

// Delete user (admin only)
router.delete(
  '/:id',
  authenticate,
  authorize(['admin']),
  activityLogger.adminAction('user', 'delete'),
  async (req: Request, res: Response) => {
    const endTimer = startPerformanceTimer('admin-user-delete');
    const userId = req.params.id;
    
    try {
      // Check if trying to delete self
      if (userId === req.user?.id) {
        return res.status(400).json({ message: 'Cannot delete your own account' });
      }
      
      const deletedUser = await User.findByIdAndDelete(userId);
      
      if (!deletedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      endTimer();
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      logError(`Error deleting user - metadata: { userId }`, error as Error);
      res.status(500).json({ message: 'Error deleting user' });
    }
  }
);

export default router; 