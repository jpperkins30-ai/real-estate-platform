import { Router } from 'express';
import { auth } from '../middleware/auth';
import DataSource from '../models/DataSource';
import Collection from '../models/Collection';

const router = Router();

// Get all data sources
router.get('/data-sources', auth, async (req, res) => {
  try {
    const dataSources = await DataSource.find();
    res.json(dataSources);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching data sources' });
  }
});

// Get data source by ID
router.get('/data-sources/:id', auth, async (req, res) => {
  try {
    const dataSource = await DataSource.findById(req.params.id);
    if (!dataSource) {
      return res.status(404).json({ error: 'Data source not found' });
    }
    res.json(dataSource);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching data source' });
  }
});

// Create new data source
router.post('/data-sources', auth, async (req, res) => {
  try {
    const dataSource = new DataSource(req.body);
    await dataSource.save();
    res.status(201).json(dataSource);
  } catch (error) {
    res.status(400).json({ error: 'Error creating data source' });
  }
});

// Update data source
router.put('/data-sources/:id', auth, async (req, res) => {
  try {
    const dataSource = await DataSource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!dataSource) {
      return res.status(404).json({ error: 'Data source not found' });
    }
    res.json(dataSource);
  } catch (error) {
    res.status(400).json({ error: 'Error updating data source' });
  }
});

// Delete data source
router.delete('/data-sources/:id', auth, async (req, res) => {
  try {
    const dataSource = await DataSource.findByIdAndDelete(req.params.id);
    if (!dataSource) {
      return res.status(404).json({ error: 'Data source not found' });
    }
    res.json({ message: 'Data source deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting data source' });
  }
});

// Get all collections
router.get('/collections', auth, async (req, res) => {
  try {
    const collections = await Collection.find();
    res.json(collections);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching collections' });
  }
});

// Get collection by ID
router.get('/collections/:id', auth, async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    res.json(collection);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching collection' });
  }
});

// Create new collection
router.post('/collections', auth, async (req, res) => {
  try {
    const collection = new Collection(req.body);
    await collection.save();
    res.status(201).json(collection);
  } catch (error) {
    res.status(400).json({ error: 'Error creating collection' });
  }
});

// Update collection
router.put('/collections/:id', auth, async (req, res) => {
  try {
    const collection = await Collection.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    res.json(collection);
  } catch (error) {
    res.status(400).json({ error: 'Error updating collection' });
  }
});

// Delete collection
router.delete('/collections/:id', auth, async (req, res) => {
  try {
    const collection = await Collection.findByIdAndDelete(req.params.id);
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    res.json({ message: 'Collection deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting collection' });
  }
});

export const collectorTypesRoutes = router; 