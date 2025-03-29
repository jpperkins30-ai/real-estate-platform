import { Router } from 'express';
import { auth } from '../middleware/auth';
import { Property } from '../models/property.model';
import { State } from '../models/State';
import { County } from '../models/County';
import { USMap } from '../models/USMap';

const router = Router();

// Test route to verify API is working
router.get('/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});

// Get all properties
router.get('/properties', auth, async (req, res) => {
  try {
    const properties = await Property.find();
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching properties' });
  }
});

// Rest of the routes remain the same...

export const mainRoutes = router; 