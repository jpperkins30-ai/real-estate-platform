// src/middleware/validation.ts
import { body } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

// Property validation rules
export const propertyValidation = [
  body('propertyAddress').notEmpty().withMessage('Property address is required'),
  body('state').notEmpty().withMessage('State is required'),
  body('county').notEmpty().withMessage('County is required'),
  body('propertyType').notEmpty().withMessage('Property type is required'),
  body('saleInfo.saleAmount').optional().isNumeric().withMessage('Sale amount must be a number'),
  body('saleInfo.saleType').optional().isIn(['Tax Lien', 'Deed', 'Conventional']).withMessage('Invalid sale type'),
  body('parcelId').optional(),
  body('ownerName').optional(),
  body('taxAccountNumber').optional(),
  body('legalDescription').optional()
];

// Layout validation rules
export const layoutValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('layoutType')
    .isIn(['single', 'dual', 'tri', 'quad'])
    .withMessage('Layout type must be single, dual, tri, or quad')
];

/**
 * Middleware to validate requests using express-validator
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}; 