import express from 'express';
import { authenticateToken, authorize } from '../middleware/auth';
import Project from '../models/Project';
import mongoose from 'mongoose';

const router = express.Router();

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of user's projects
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Invalid token
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Get user ID from auth middleware
    const userId = req.user!.id;
    
    // Find projects where the user is the owner
    const projects = await Project.find({
      owner: userId,
      parentProject: { $exists: false } // Only top-level projects
    });
    
    res.json(projects);
  } catch (error) {
    console.error('Error retrieving projects:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project details
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Invalid token
 *       404:
 *         description: Project not found
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is owner or admin
    const userId = req.user!.id;
    const userRole = req.user!.role;
    
    if (project.owner.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this project' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error retrieving project:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 required: true
 *               description:
 *                 type: string
 *               parentProject:
 *                 type: string
 *     responses:
 *       201:
 *         description: Project created
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Invalid token
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, parentProject, filters, settings } = req.body;
    
    // Get user ID from auth middleware
    const userId = req.user!.id;
    
    // Create new project
    const project = new Project({
      name,
      description,
      owner: userId,
      parentProject,
      properties: [],
      filters,
      settings
    });
    
    await project.save();
    
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update a project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Project updated
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Not authorized to update this project
 *       404:
 *         description: Project not found
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is owner or admin
    const userId = req.user!.id;
    const userRole = req.user!.role;
    
    if (project.owner.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }
    
    // Update project
    const { name, description, parentProject, filters, settings } = req.body;
    
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (parentProject) project.parentProject = parentProject;
    if (filters) project.filters = filters;
    if (settings) project.settings = settings;
    
    await project.save();
    
    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete a project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Not authorized to delete this project
 *       404:
 *         description: Project not found
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is owner or admin
    const userId = req.user!.id;
    const userRole = req.user!.role;
    
    if (project.owner.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }
    
    // Delete project
    await project.deleteOne();
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * @swagger
 * /api/projects/{id}/properties:
 *   post:
 *     summary: Add properties to a project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               propertyIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Properties added to project
 *       400:
 *         description: Bad request - propertyIds must be an array
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Not authorized to update this project
 *       404:
 *         description: Project not found
 */
router.post('/:id/properties', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is owner or admin
    const userId = req.user!.id;
    const userRole = req.user!.role;
    
    if (project.owner.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }
    
    // Add properties
    const { propertyIds } = req.body;
    
    if (!Array.isArray(propertyIds)) {
      return res.status(400).json({ message: 'propertyIds must be an array' });
    }
    
    // Convert string IDs to ObjectIds
    const objectIds = propertyIds.map(id => new mongoose.Types.ObjectId(id));
    
    // Add properties to project (avoiding duplicates)
    const existingIds = project.properties.map(id => id.toString());
    const newIds = objectIds.filter(id => !existingIds.includes(id.toString()));
    
    project.properties = [...project.properties, ...newIds];
    
    await project.save();
    
    res.json(project);
  } catch (error) {
    console.error('Error adding properties to project:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * @swagger
 * /api/projects/{id}/properties/{propertyId}:
 *   delete:
 *     summary: Remove a property from a project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property removed from project
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Not authorized to update this project
 *       404:
 *         description: Project not found
 */
router.delete('/:id/properties/:propertyId', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is owner or admin
    const userId = req.user!.id;
    const userRole = req.user!.role;
    
    if (project.owner.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }
    
    // Remove property
    const propertyId = req.params.propertyId;
    
    project.properties = project.properties.filter(
      id => id.toString() !== propertyId
    );
    
    await project.save();
    
    res.json(project);
  } catch (error) {
    console.error('Error removing property from project:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * @swagger
 * /api/projects/{id}/subprojects:
 *   get:
 *     summary: Get subprojects for a project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of subprojects
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Not authorized to access this project
 *       404:
 *         description: Project not found
 */
router.get('/:id/subprojects', authenticateToken, async (req, res) => {
  try {
    const projectId = req.params.id;
    
    // Check if user has access to parent project
    const parentProject = await Project.findById(projectId);
    
    if (!parentProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is owner or admin
    const userId = req.user!.id;
    const userRole = req.user!.role;
    
    if (parentProject.owner.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this project' });
    }
    
    // Get subprojects
    const subprojects = await Project.find({ parentProject: projectId });
    
    res.json(subprojects);
  } catch (error) {
    console.error('Error retrieving subprojects:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router; 