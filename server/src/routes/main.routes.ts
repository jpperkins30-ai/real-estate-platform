import { Router } from 'express';
import { auth } from '../middleware/auth';
import { Property } from '../models/property.model';
import { State } from '../models/state.model';
import { County } from '../models/county.model';
import { USMap } from '../models/usmap.model';
import express from 'express';

const router = Router();

// Get all properties
router.get('/properties', auth, async (req, res) => {
  try {
    const properties = await Property.find();
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching properties' });
  }
});

// Get property by ID
router.get('/properties/:id', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json(property);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching property' });
  }
});

// Get all states
router.get('/states', auth, async (req, res) => {
  try {
    const states = await State.find();
    res.json(states);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching states' });
  }
});

// Get state by ID
router.get('/states/:id', auth, async (req, res) => {
  try {
    const state = await State.findById(req.params.id);
    if (!state) {
      return res.status(404).json({ error: 'State not found' });
    }
    res.json(state);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching state' });
  }
});

// Get all counties
router.get('/counties', auth, async (req, res) => {
  try {
    const counties = await County.find();
    res.json(counties);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching counties' });
  }
});

// Get county by ID
router.get('/counties/:id', auth, async (req, res) => {
  try {
    const county = await County.findById(req.params.id);
    if (!county) {
      return res.status(404).json({ error: 'County not found' });
    }
    res.json(county);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching county' });
  }
});

// Get US map
router.get('/us-map', auth, async (req, res) => {
  try {
    const usMap = await USMap.findOne();
    if (!usMap) {
      return res.status(404).json({ error: 'US map not found' });
    }
    res.json(usMap);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching US map' });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    serverTime: new Date().toISOString()
  });
});

// Test route to verify API is working
const testRouter = express.Router();
testRouter.get('/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});

export const mainRoutes = router; 