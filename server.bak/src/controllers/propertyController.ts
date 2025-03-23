// src/controllers/propertyController.ts
import { Request, Response } from 'express';
import Property from '../models/Property';

export const getAllProperties = async (req: Request, res: Response): Promise<void> => {
  try {
    const properties = await Property.find();
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const getPropertyById = async (req: Request, res: Response): Promise<void> => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }
    res.json(property);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Add more controller functions as needed