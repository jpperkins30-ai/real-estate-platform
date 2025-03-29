import Property, { IProperty } from '../../models/property.model';
import logger from '../../utils/logger';

export class TransformationPipeline {
  /**
   * Runs the entire transformation pipeline on a property
   * @param property The property to transform
   * @returns The transformed property
   */
  public async transform(property: IProperty): Promise<IProperty> {
    try {
      // Clone the property to avoid mutating the original
      const transformedProperty = JSON.parse(JSON.stringify(property));
      
      // Run the transformation steps
      this.validateRequiredFields(transformedProperty);
      this.normalizeAddress(transformedProperty);
      this.extractNumericValues(transformedProperty);
      this.standardizePropertyTypes(transformedProperty);
      
      logger.info(`Transformation pipeline completed for property ${property._id}`);
      return transformedProperty;
    } catch (error) {
      logger.error(`Transformation pipeline failed for property ${property._id}`, error);
      throw error;
    }
  }
  
  /**
   * Validates that all required fields are present in the property
   * @param property The property to validate
   * @throws Error if required fields are missing
   */
  private validateRequiredFields(property: IProperty): void {
    const requiredFields = ['propertyAddress', 'county', 'state'];
    
    const missingFields = requiredFields.filter(field => !property[field as keyof IProperty]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }
  
  /**
   * Normalizes the address format
   * @param property The property to normalize
   */
  private normalizeAddress(property: IProperty): void {
    if (!property.propertyAddress) return;
    
    // Convert address to uppercase
    property.propertyAddress = property.propertyAddress.toUpperCase().trim();
    if (property.city) {
      property.city = property.city.toUpperCase().trim();
    }
    
    // Standardize state to uppercase two-letter code
    if (property.state) {
      property.state = property.state.toUpperCase().trim();
      
      // Map full state names to abbreviations if needed
      const stateMap: Record<string, string> = {
        'MARYLAND': 'MD',
        'VIRGINIA': 'VA',
        // Add more states as needed
      };
      
      if (property.state.length > 2 && stateMap[property.state]) {
        property.state = stateMap[property.state];
      }
    }
    
    // Format zip code to standard 5-digit format
    if (property.zipCode) {
      property.zipCode = property.zipCode.toString().substring(0, 5);
    }
    
    // Remove common abbreviations and standardize
    if (property.propertyAddress) {
      property.propertyAddress = property.propertyAddress
        .replace(/\bST\b/g, 'STREET')
        .replace(/\bRD\b/g, 'ROAD')
        .replace(/\bAVE\b/g, 'AVENUE')
        .replace(/\bBLVD\b/g, 'BOULEVARD')
        .replace(/\bLN\b/g, 'LANE')
        .replace(/\bCT\b/g, 'COURT')
        .replace(/\bDR\b/g, 'DRIVE')
        .replace(/\bCIR\b/g, 'CIRCLE');
    }
  }
  
  /**
   * Extracts numeric values from string fields and converts them to numbers
   * @param property The property to transform
   */
  private extractNumericValues(property: IProperty): void {
    // Convert price string to number if it exists
    if (property.saleInfo?.saleAmount && typeof property.saleInfo.saleAmount === 'string') {
      const numericPrice = parseFloat((property.saleInfo.saleAmount as unknown as string).replace(/[$,]/g, ''));
      if (!isNaN(numericPrice)) {
        property.saleInfo.saleAmount = numericPrice;
      }
    }
    
    // Convert area to number
    if (property.propertyDetails?.landArea && typeof property.propertyDetails.landArea === 'string') {
      const areaMatch = (property.propertyDetails.landArea as unknown as string).match(/[\d,.]+/);
      if (areaMatch) {
        const numericArea = parseFloat(areaMatch[0].replace(/,/g, ''));
        if (!isNaN(numericArea)) {
          property.propertyDetails.landArea = numericArea;
        }
      }
    }
    
    // Convert building area to number
    if (property.propertyDetails?.buildingArea && typeof property.propertyDetails.buildingArea === 'string') {
      const areaMatch = (property.propertyDetails.buildingArea as unknown as string).match(/[\d,.]+/);
      if (areaMatch) {
        const numericArea = parseFloat(areaMatch[0].replace(/,/g, ''));
        if (!isNaN(numericArea)) {
          property.propertyDetails.buildingArea = numericArea;
        }
      }
    }
    
    // Convert year built to number
    if (property.propertyDetails?.yearBuilt && typeof property.propertyDetails.yearBuilt === 'string') {
      const year = parseInt(property.propertyDetails.yearBuilt as unknown as string, 10);
      if (!isNaN(year)) {
        property.propertyDetails.yearBuilt = year;
      }
    }
    
    // Format tax information
    if (property.taxInfo) {
      if (typeof property.taxInfo.assessedValue === 'string') {
        property.taxInfo.assessedValue = parseFloat((property.taxInfo.assessedValue as unknown as string).replace(/[$,]/g, ''));
      }
      
      if (typeof property.taxInfo.taxDue === 'string') {
        property.taxInfo.taxDue = parseFloat((property.taxInfo.taxDue as unknown as string).replace(/[$,]/g, ''));
      }
    }
  }
  
  /**
   * Standardizes property types to use consistent terminology
   * @param property The property to standardize
   */
  private standardizePropertyTypes(property: IProperty): void {
    if (!property.propertyType) return;
    
    const propertyType = property.propertyType.toUpperCase();
    
    // Map common variations to standard terminology
    const propertyTypeMap: Record<string, string> = {
      'SINGLE FAMILY': 'SINGLE_FAMILY',
      'SINGLE FAMILY HOME': 'SINGLE_FAMILY',
      'SINGLE-FAMILY': 'SINGLE_FAMILY',
      'RESIDENTIAL': 'SINGLE_FAMILY',
      'DETACHED': 'SINGLE_FAMILY',
      
      'TOWNHOUSE': 'TOWNHOME',
      'TOWN HOME': 'TOWNHOME',
      'TOWN HOUSE': 'TOWNHOME',
      'ATTACHED': 'TOWNHOME',
      
      'CONDO': 'CONDOMINIUM',
      'APARTMENT': 'CONDOMINIUM',
      'FLAT': 'CONDOMINIUM',
      
      'MULTI FAMILY': 'MULTI_FAMILY',
      'MULTI-FAMILY': 'MULTI_FAMILY',
      'DUPLEX': 'MULTI_FAMILY',
      'TRIPLEX': 'MULTI_FAMILY',
      'QUADPLEX': 'MULTI_FAMILY',
      
      'VACANT': 'VACANT_LAND',
      'VACANT LOT': 'VACANT_LAND',
      'LAND': 'VACANT_LAND',
      'UNDEVELOPED': 'VACANT_LAND',
      
      'COMMERCIAL': 'COMMERCIAL',
      'BUSINESS': 'COMMERCIAL',
      'RETAIL': 'COMMERCIAL',
      'OFFICE': 'COMMERCIAL',
      
      'FARM': 'AGRICULTURAL',
      'AGRICULTURAL': 'AGRICULTURAL',
      'RANCH': 'AGRICULTURAL',
    };
    
    for (const [key, value] of Object.entries(propertyTypeMap)) {
      if (propertyType.includes(key)) {
        property.propertyType = value;
        break;
      }
    }
  }
} 