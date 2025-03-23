// src/middleware/validation.ts
import { body } from 'express-validator';

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