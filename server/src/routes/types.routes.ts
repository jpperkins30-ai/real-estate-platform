import { Router } from 'express';
import { auth } from '../middleware/auth';
import { Controller } from '../models/Controller';

const router = Router();

// Get all controllers
router.get('/controllers', auth, async (req, res) => {
  try {
    const controllers = await Controller.find();
    res.json(controllers);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching controllers' });
  }
});

// Get controller by ID
router.get('/controllers/:id', auth, async (req, res) => {
  try {
    const controller = await Controller.findById(req.params.id);
    if (!controller) {
      return res.status(404).json({ error: 'Controller not found' });
    }
    res.json(controller);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching controller' });
  }
});

// Create new controller
router.post('/controllers', auth, async (req, res) => {
  try {
    const controller = new Controller(req.body);
    await controller.save();
    res.status(201).json(controller);
  } catch (error) {
    res.status(400).json({ error: 'Error creating controller' });
  }
});

// Update controller
router.put('/controllers/:id', auth, async (req, res) => {
  try {
    const controller = await Controller.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!controller) {
      return res.status(404).json({ error: 'Controller not found' });
    }
    res.json(controller);
  } catch (error) {
    res.status(400).json({ error: 'Error updating controller' });
  }
});

// Delete controller
router.delete('/controllers/:id', auth, async (req, res) => {
  try {
    const controller = await Controller.findByIdAndDelete(req.params.id);
    if (!controller) {
      return res.status(404).json({ error: 'Controller not found' });
    }
    res.json({ message: 'Controller deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting controller' });
  }
});

export const typesRoutes = router; 