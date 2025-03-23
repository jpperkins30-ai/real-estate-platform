import { body, ValidationChain } from 'express-validator';

export const registerValidation: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
];

export const loginValidation: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const passwordResetRequestValidation: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address')
];

export const passwordResetValidation: ValidationChain[] = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
];

export const propertyValidation: ValidationChain[] = [
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Address must be between 5 and 200 characters'),

  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s-]+$/)
    .withMessage('City can only contain letters, spaces, and hyphens'),

  body('state')
    .trim()
    .notEmpty()
    .withMessage('State is required')
    .isLength({ min: 2, max: 2 })
    .withMessage('State must be a 2-letter code')
    .isUppercase()
    .withMessage('State must be uppercase')
    .matches(/^[A-Z]+$/)
    .withMessage('State can only contain letters'),

  body('county')
    .trim()
    .notEmpty()
    .withMessage('County is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('County must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s-]+$/)
    .withMessage('County can only contain letters, spaces, and hyphens'),

  body('zipCode')
    .trim()
    .notEmpty()
    .withMessage('Zip code is required')
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('Invalid zip code format (e.g., 12345 or 12345-6789)'),

  body('propertyType')
    .trim()
    .notEmpty()
    .withMessage('Property type is required')
    .isIn(['Single Family', 'Multi Family', 'Condo', 'Townhouse', 'Land', 'Commercial', 'Industrial', 'Agricultural'])
    .withMessage('Invalid property type'),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0, max: 1000000000 })
    .withMessage('Price must be between 0 and 1,000,000,000')
    .custom((value) => {
      if (value % 0.01 !== 0) {
        throw new Error('Price can have maximum 2 decimal places');
      }
      return true;
    }),

  body('saleType')
    .trim()
    .notEmpty()
    .withMessage('Sale type is required')
    .isIn(['Tax Lien', 'Deed', 'Conventional'])
    .withMessage('Invalid sale type'),

  body('lotSize')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Lot size must be a positive number')
    .custom((value) => {
      if (value % 0.01 !== 0) {
        throw new Error('Lot size can have maximum 2 decimal places');
      }
      return true;
    }),

  body('yearBuilt')
    .optional()
    .isInt({ min: 1800, max: new Date().getFullYear() })
    .withMessage(`Year built must be between 1800 and ${new Date().getFullYear()}`),

  body('bedrooms')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Number of bedrooms must be between 0 and 100'),

  body('bathrooms')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Number of bathrooms must be between 0 and 100')
    .custom((value) => {
      if (value % 0.5 !== 0) {
        throw new Error('Bathrooms must be in increments of 0.5');
      }
      return true;
    }),

  body('parkingSpaces')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Number of parking spaces must be between 0 and 100'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),

  body('features')
    .optional()
    .isArray()
    .withMessage('Features must be an array')
    .custom((value) => {
      if (!Array.isArray(value)) return false;
      return value.every(item => 
        typeof item === 'string' && 
        item.length > 0 && 
        item.length <= 100
      );
    })
    .withMessage('Each feature must be a non-empty string with maximum 100 characters'),

  body('status')
    .optional()
    .trim()
    .isIn(['Available', 'Under Contract', 'Sold', 'Off Market'])
    .withMessage('Invalid property status'),

  body('taxAssessment')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Tax assessment must be a positive number')
    .custom((value) => {
      if (value % 0.01 !== 0) {
        throw new Error('Tax assessment can have maximum 2 decimal places');
      }
      return true;
    }),

  body('taxYear')
    .optional()
    .isInt({ min: 2000, max: new Date().getFullYear() })
    .withMessage(`Tax year must be between 2000 and ${new Date().getFullYear()}`),

  body('zoning')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Zoning cannot exceed 50 characters')
]; 