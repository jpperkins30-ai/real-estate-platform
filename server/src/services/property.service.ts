import { Property, IProperty } from '../models/property.model';
import { PropertyObject, PropertySearchCriteria, PropertySearchResponse, PropertyTaxStatus } from '../types/inventory';

export class PropertyService {
  /**
   * Get all properties
   */
  async getAllProperties(): Promise<IProperty[]> {
    return Property.find().exec();
  }

  /**
   * Get a property by ID
   */
  async getPropertyById(id: string): Promise<IProperty | null> {
    return Property.findById(id).exec();
  }

  /**
   * Create a new property
   */
  async createProperty(propertyData: Omit<PropertyObject, '_id'>): Promise<IProperty> {
    const property = new Property(propertyData);
    return property.save();
  }

  /**
   * Update a property
   */
  async updateProperty(id: string, propertyData: Partial<PropertyObject>): Promise<IProperty | null> {
    return Property.findByIdAndUpdate(
      id,
      { $set: propertyData },
      { new: true, runValidators: true }
    ).exec();
  }

  /**
   * Delete a property
   */
  async deleteProperty(id: string): Promise<boolean> {
    const result = await Property.findByIdAndDelete(id).exec();
    return result !== null;
  }

  /**
   * Search properties based on criteria
   */
  async searchProperties(
    criteria: PropertySearchCriteria,
    page: number = 1,
    pageSize: number = 10
  ): Promise<PropertySearchResponse> {
    const query: any = {};

    // Build query based on search criteria
    if (criteria.propertyTypes?.length) {
      query['features.type'] = { $in: criteria.propertyTypes };
    }
    if (criteria.conditions?.length) {
      query['features.condition'] = { $in: criteria.conditions };
    }
    if (criteria.statuses?.length) {
      query.status = { $in: criteria.statuses };
    }
    if (criteria.minValue !== undefined) {
      query['taxStatus.marketValue'] = { $gte: criteria.minValue };
    }
    if (criteria.maxValue !== undefined) {
      query['taxStatus.marketValue'] = { ...query['taxStatus.marketValue'], $lte: criteria.maxValue };
    }
    if (criteria.minSquareFeet !== undefined) {
      query['features.squareFeet'] = { $gte: criteria.minSquareFeet };
    }
    if (criteria.maxSquareFeet !== undefined) {
      query['features.squareFeet'] = { ...query['features.squareFeet'], $lte: criteria.maxSquareFeet };
    }
    if (criteria.minBedrooms !== undefined) {
      query['features.bedrooms'] = { $gte: criteria.minBedrooms };
    }
    if (criteria.maxBedrooms !== undefined) {
      query['features.bedrooms'] = { ...query['features.bedrooms'], $lte: criteria.maxBedrooms };
    }
    if (criteria.minBathrooms !== undefined) {
      query['features.bathrooms'] = { $gte: criteria.minBathrooms };
    }
    if (criteria.maxBathrooms !== undefined) {
      query['features.bathrooms'] = { ...query['features.bathrooms'], $lte: criteria.maxBathrooms };
    }
    if (criteria.minYearBuilt !== undefined) {
      query['features.yearBuilt'] = { $gte: criteria.minYearBuilt };
    }
    if (criteria.maxYearBuilt !== undefined) {
      query['features.yearBuilt'] = { ...query['features.yearBuilt'], $lte: criteria.maxYearBuilt };
    }
    if (criteria.minLotSize !== undefined) {
      query['features.lotSize'] = { $gte: criteria.minLotSize };
    }
    if (criteria.maxLotSize !== undefined) {
      query['features.lotSize'] = { ...query['features.lotSize'], $lte: criteria.maxLotSize };
    }
    if (criteria.hasTaxLien) {
      query['taxStatus.taxLienStatus'] = 'Active';
    }
    if (criteria.counties?.length) {
      query['location.address.county'] = { $in: criteria.counties };
    }
    if (criteria.states?.length) {
      query['location.address.state'] = { $in: criteria.states };
    }
    if (criteria.tags?.length) {
      query['metadata.tags'] = { $in: criteria.tags };
    }

    // Add any additional filters
    if (criteria.additionalFilters) {
      Object.assign(query, criteria.additionalFilters);
    }

    // Execute query with pagination
    const skip = (page - 1) * pageSize;
    const [properties, total] = await Promise.all([
      Property.find(query)
        .skip(skip)
        .limit(pageSize)
        .exec(),
      Property.countDocuments(query)
    ]);

    return {
      properties,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  /**
   * Get tax status for a property
   */
  async getPropertyTaxStatus(id: string): Promise<PropertyTaxStatus> {
    const property = await Property.findById(id)
      .select('taxStatus')
      .exec();

    if (!property) {
      throw new Error('Property not found');
    }

    return property.taxStatus;
  }

  /**
   * Update tax status for a property
   */
  async updatePropertyTaxStatus(id: string, taxStatus: Partial<PropertyTaxStatus>): Promise<IProperty> {
    const property = await Property.findById(id);
    
    if (!property) {
      throw new Error('Property not found');
    }

    property.taxStatus = {
      ...property.taxStatus,
      ...taxStatus,
      lastUpdated: new Date()
    };

    return property.save();
  }
} 