// @ts-nocheck
import { Property, IProperty } from '../models/property.model';
import { County } from '../models/county.model';
import { State } from '../models/state.model';
import { PropertyObject, PropertySearchCriteria, PropertySearchResponse, PropertyTaxStatus } from '../types/inventory';
import mongoose from 'mongoose';

export class PropertyService {
  /**
   * Get all properties with pagination
   */
  async getAllProperties(page: number = 1, limit: number = 20): Promise<{ properties: IProperty[], total: number }> {
    const skip = (page - 1) * limit;
    
    const [properties, total] = await Promise.all([
      Property.find()
        .skip(skip)
        .limit(limit)
        .exec(),
      Property.countDocuments()
    ]);
    
    return { properties, total };
  }

  /**
   * Get a property by ID
   */
  async getPropertyById(id: string): Promise<IProperty | null> {
    return Property.findById(id).exec();
  }

  /**
   * Create a new property with parent-child relationship updates
   */
  async createProperty(propertyData: Omit<PropertyObject, '_id'>): Promise<IProperty> {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Validate that the parent county exists
      const county = await County.findById(propertyData.countyId);
      if (!county) {
        throw new Error('Parent county not found');
      }
      
      // Create the property
      const property = new Property(propertyData);
      await property.save({ session });
      
      // Update the parent county document to include this property
      await County.findByIdAndUpdate(
        propertyData.countyId,
        { 
          $push: { properties: property._id },
          $inc: { propertyCount: 1 }
        },
        { session }
      );
      
      // Update statistics in the parent county
      const taxLienStatus = propertyData.taxStatus?.taxLienStatus;
      const assessedValue = propertyData.taxStatus?.assessedValue || 0;
      
      if (taxLienStatus === 'Active') {
        await County.findByIdAndUpdate(
          propertyData.countyId,
          { 
            $inc: { 
              'stats.totalTaxLiens': 1,
              'stats.totalValue': assessedValue,
              'stats.totalPropertiesWithLiens': 1
            }
          },
          { session }
        );
      } else {
        await County.findByIdAndUpdate(
          propertyData.countyId,
          { 
            $inc: { 
              'stats.totalValue': assessedValue
            }
          },
          { session }
        );
      }
      
      // Also update the state statistics
      const state = await State.findById(county.stateId);
      if (state) {
        await State.findByIdAndUpdate(
          county.stateId,
          { 
            $inc: { 
              totalProperties: 1,
              'stats.totalValue': assessedValue
            }
          },
          { session }
        );
        
        if (taxLienStatus === 'Active') {
          await State.findByIdAndUpdate(
            county.stateId,
            { 
              $inc: { 
                'stats.totalTaxLiens': 1,
                'stats.totalPropertiesWithLiens': 1
              }
            },
            { session }
          );
        }
      }
      
      await session.commitTransaction();
      return property;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Update a property
   */
  async updateProperty(id: string, propertyData: Partial<PropertyObject>): Promise<IProperty | null> {
    // If updating the countyId, a more complex update would be needed to maintain the hierarchy
    if (propertyData.countyId) {
      throw new Error('Cannot update countyId directly. Use moveProperty method instead.');
    }
    
    return Property.findByIdAndUpdate(
      id,
      { $set: propertyData },
      { new: true, runValidators: true }
    ).exec();
  }

  /**
   * Delete a property with proper cleanup of relationships
   */
  async deleteProperty(id: string): Promise<boolean> {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Get the property to be deleted
      const property = await Property.findById(id);
      
      if (!property) {
        return false;
      }
      
      // Get the parent county
      const county = await County.findById(property.countyId);
      
      if (county) {
        // Update the parent county to remove this property
        await County.findByIdAndUpdate(
          property.countyId,
          { 
            $pull: { properties: property._id },
            $inc: { propertyCount: -1 }
          },
          { session }
        );
        
        // Update statistics in the parent county
        const taxLienStatus = property.taxStatus?.taxLienStatus;
        const assessedValue = property.taxStatus?.assessedValue || 0;
        
        if (taxLienStatus === 'Active') {
          await County.findByIdAndUpdate(
            property.countyId,
            { 
              $inc: { 
                'stats.totalTaxLiens': -1,
                'stats.totalValue': -assessedValue,
                'stats.totalPropertiesWithLiens': -1
              }
            },
            { session }
          );
        } else {
          await County.findByIdAndUpdate(
            property.countyId,
            { 
              $inc: { 
                'stats.totalValue': -assessedValue
              }
            },
            { session }
          );
        }
        
        // Also update the state statistics
        if (county.stateId) {
          await State.findByIdAndUpdate(
            county.stateId,
            { 
              $inc: { 
                totalProperties: -1,
                'stats.totalValue': -assessedValue
              }
            },
            { session }
          );
          
          if (taxLienStatus === 'Active') {
            await State.findByIdAndUpdate(
              county.stateId,
              { 
                $inc: { 
                  'stats.totalTaxLiens': -1,
                  'stats.totalPropertiesWithLiens': -1
                }
              },
              { session }
            );
          }
        }
      }
      
      // Delete the property
      await Property.findByIdAndDelete(id).session(session);
      
      await session.commitTransaction();
      return true;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Search properties based on query criteria with pagination and sorting
   */
  async searchProperties(
    query: any,
    page: number = 1,
    limit: number = 20,
    sort: Record<string, 1 | -1> = { updatedAt: -1 }
  ): Promise<{ properties: IProperty[], total: number }> {
    const skip = (page - 1) * limit;
    
    const [properties, total] = await Promise.all([
      Property.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      Property.countDocuments(query)
    ]);
    
    return { properties, total };
  }
  
  /**
   * Get properties by county and state IDs
   */
  async getPropertiesByCountyAndState(countyId: string, stateId: string): Promise<IProperty[]> {
    // First verify that the county belongs to the state
    const county = await County.findOne({ _id: countyId, stateId: stateId });
    
    if (!county) {
      throw new Error('County not found in the specified state');
    }
    
    // Then get all properties for this county
    return Property.find({ countyId: countyId }).exec();
  }
  
  /**
   * Move a property to a different county
   */
  async moveProperty(propertyId: string, newCountyId: string): Promise<IProperty | null> {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Get the property
      const property = await Property.findById(propertyId);
      
      if (!property) {
        return null;
      }
      
      // Get the old and new counties
      const oldCountyId = property.countyId;
      const [oldCounty, newCounty] = await Promise.all([
        County.findById(oldCountyId),
        County.findById(newCountyId)
      ]);
      
      if (!oldCounty || !newCounty) {
        throw new Error('County not found');
      }
      
      // Update property with new county
      property.countyId = newCountyId;
      
      // Update property state reference if the counties belong to different states
      if (oldCounty.stateId.toString() !== newCounty.stateId.toString()) {
        property.stateId = newCounty.stateId;
      }
      
      await property.save({ session });
      
      // Update old county to remove property
      await County.findByIdAndUpdate(
        oldCountyId,
        { 
          $pull: { properties: property._id },
          $inc: { propertyCount: -1 }
        },
        { session }
      );
      
      // Update new county to add property
      await County.findByIdAndUpdate(
        newCountyId,
        { 
          $push: { properties: property._id },
          $inc: { propertyCount: 1 }
        },
        { session }
      );
      
      // Update state statistics if the counties belong to different states
      if (oldCounty.stateId.toString() !== newCounty.stateId.toString()) {
        // Decrement old state
        await State.findByIdAndUpdate(
          oldCounty.stateId,
          { $inc: { totalProperties: -1 } },
          { session }
        );
        
        // Increment new state
        await State.findByIdAndUpdate(
          newCounty.stateId,
          { $inc: { totalProperties: 1 } },
          { session }
        );
      }
      
      await session.commitTransaction();
      return property;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get property statistics
   */
  async getPropertyStats(id: string): Promise<any> {
    const property = await Property.findById(id)
      .select('stats')
      .exec();

    if (!property) {
      throw new Error('Property not found');
    }

    return property.stats;
  }

  /**
   * Update property statistics
   */
  async updatePropertyStats(id: string, statsUpdate: any): Promise<IProperty> {
    const property = await Property.findById(id);
    
    if (!property) {
      throw new Error('Property not found');
    }

    // Create update object for nested stats fields
    const updateData: any = {};
    
    // Update specific stats fields
    Object.keys(statsUpdate).forEach(key => {
      updateData[`stats.${key}`] = statsUpdate[key];
    });
    
    // Update last updated timestamp
    updateData['stats.lastUpdated'] = new Date();

    // Apply updates
    return Property.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).exec();
  }
} 