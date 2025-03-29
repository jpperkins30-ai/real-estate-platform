import { Types } from 'mongoose';

/**
 * Type guard for checking if a value is not null or undefined
 * @param value The value to check
 * @returns True if the value is not null or undefined
 */
export function isNotNullOrUndefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard for checking if a reference is populated
 * @param value The reference to check
 * @param fieldName Field name to look for in the populated object
 * @returns True if the reference is populated
 */
export function isPopulated<T extends object>(
  value: string | T | null | undefined,
  fieldName: keyof T
): value is T {
  return typeof value === 'object' && value !== null && fieldName in value;
}

/**
 * Type guard for checking if a value is a valid MongoDB ObjectId
 * @param value The value to check
 * @returns True if the value is a valid MongoDB ObjectId
 */
export function isObjectId(value: unknown): value is Types.ObjectId {
  return value instanceof Types.ObjectId;
}

/**
 * Type guard for checking if a value is a valid string ObjectId
 * @param value The value to check
 * @returns True if the value is a valid string ObjectId
 */
export function isStringObjectId(value: unknown): value is string {
  return typeof value === 'string' && Types.ObjectId.isValid(value);
}

/**
 * Type guard for checking if a value is a non-empty string
 * @param value The value to check
 * @returns True if the value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Type guard for checking if a value is a valid number
 * @param value The value to check
 * @returns True if the value is a valid number
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Type guard for checking if a value is a valid date
 * @param value The value to check
 * @returns True if the value is a valid date
 */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Type guard for checking if a value is a non-empty array
 * @param value The value to check
 * @returns True if the value is a non-empty array
 */
export function isNonEmptyArray<T>(value: unknown): value is T[] {
  return Array.isArray(value) && value.length > 0;
}

/**
 * Type guard for checking if a value is a valid property type
 * @param value The value to check
 * @returns True if the value is a valid property type
 */
export function isValidPropertyType(value: unknown): value is string {
  const validTypes = [
    'Single Family',
    'Multi Family',
    'Commercial',
    'Industrial',
    'Land',
    'Other'
  ];
  return typeof value === 'string' && validTypes.includes(value);
}

/**
 * Type guard for checking if a value is a valid tax status
 * @param value The value to check
 * @returns True if the value is a valid tax status
 */
export function isValidTaxStatus(value: unknown): value is string {
  const validStatuses = [
    'Current',
    'Delinquent',
    'Tax Lien',
    'Foreclosure',
    'Bankruptcy',
    'Unknown'
  ];
  return typeof value === 'string' && validStatuses.includes(value);
}

/**
 * Type guard for checking if a value is a valid property metadata object
 * @param value The value to check
 * @returns True if the value is a valid property metadata object
 */
export function isValidPropertyMetadata(value: unknown): value is {
  propertyType?: string;
  yearBuilt?: number;
  landArea?: number;
  landAreaUnit?: string;
  buildingArea?: number;
  buildingAreaUnit?: string;
  taxStatus?: string;
  assessedValue?: number;
  marketValue?: number;
  taxDue?: number;
  saleType?: string;
  saleAmount?: number;
  saleDate?: Date;
} {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value)
  );
}

/**
 * Type guard for checking if a value is a valid property location object
 * @param value The value to check
 * @returns True if the value is a valid property location object
 */
export function isValidPropertyLocation(value: unknown): value is {
  type: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    county?: string;
  };
} {
  return (
    value !== null &&
    typeof value === 'object' &&
    'type' in value &&
    'coordinates' in value &&
    'address' in value &&
    typeof (value as any).coordinates.latitude === 'number' &&
    typeof (value as any).coordinates.longitude === 'number'
  );
}

/**
 * Type guard for checking if a value is a valid property features object
 * @param value The value to check
 * @returns True if the value is a valid property features object
 */
export function isValidPropertyFeatures(value: unknown): value is {
  type?: string;
  condition?: string;
  yearBuilt?: number;
  squareFeet?: number;
  bedrooms?: number;
  bathrooms?: number;
  stories?: number;
  parking?: {
    type: string;
    spaces: number;
  };
  amenities?: string[];
} {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value)
  );
}

/**
 * Type guard for checking if a value is a valid property tax status object
 * @param value The value to check
 * @returns True if the value is a valid property tax status object
 */
export function isValidPropertyTaxStatus(value: unknown): value is {
  status: string;
  assessedValue: number;
  marketValue: number;
  annualTaxAmount: number;
  taxLienAmount?: number;
  taxLienStatus?: string;
  lastAssessmentDate?: Date;
  nextAssessmentDate?: Date;
} {
  return (
    value !== null &&
    typeof value === 'object' &&
    'status' in value &&
    'assessedValue' in value &&
    'marketValue' in value &&
    'annualTaxAmount' in value
  );
}

/**
 * Type guard for mongoose document references that could be strings or objects
 * @param ref The reference to check
 * @returns The properly typed reference ID or null if invalid
 */
export function getRefId(ref: string | { _id: string } | null | undefined): string | null {
  if (!ref) return null;
  if (typeof ref === 'string') return ref;
  if (typeof ref === 'object' && '_id' in ref) return ref._id.toString();
  return null;
}

/**
 * Type guard for extracting a nested property safely using dot notation
 * @param obj The object to extract from
 * @param path The dot notation path to the property (e.g., 'metadata.propertyType')
 * @returns The extracted property or undefined if not found
 */
export function getNestedProperty<T>(obj: any, path: string): T | undefined {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = current[key];
  }
  
  return current as T;
}

/**
 * Type guard for checking if a value is a valid property reference
 * @param value The value to check
 * @returns True if the value is a valid property reference
 */
export function isValidPropertyReference(value: unknown): value is {
  _id: Types.ObjectId;
  parcelId: string;
  propertyAddress: string;
} {
  return (
    value !== null &&
    typeof value === 'object' &&
    '_id' in value &&
    'parcelId' in value &&
    'propertyAddress' in value
  );
}

/**
 * Type guard for checking if a value is a valid property search result
 * @param value The value to check
 * @returns True if the value is a valid property search result
 */
export function isValidPropertySearchResult(value: unknown): value is {
  _id: Types.ObjectId;
  parcelId: string;
  propertyAddress: string;
  city: string;
  state: string;
  zipCode: string;
  metadata: {
    propertyType?: string;
    assessedValue?: number;
    marketValue?: number;
  };
} {
  return (
    value !== null &&
    typeof value === 'object' &&
    '_id' in value &&
    'parcelId' in value &&
    'propertyAddress' in value &&
    'city' in value &&
    'state' in value &&
    'zipCode' in value &&
    'metadata' in value
  );
} 