// @ts-nocheck
import { County } from '../models/county.model';
import { Property } from '../models/property.model';
import axios from 'axios';

interface TaxLienCheckResult {
  status: 'clear' | 'lien' | 'unknown' | 'error';
  message: string;
  amount?: number;
  date?: string;
  details?: Record<string, any>;
}

export class TaxLienService {
  /**
   * Check the tax lien status for a property
   */
  async checkTaxLienStatus(
    propertyId: string,
    countyId: string,
    accountNumber?: string,
    parcelId?: string
  ): Promise<TaxLienCheckResult> {
    try {
      // Get property and county data
      const property = await Property.findById(propertyId);
      if (!property) {
        return { 
          status: 'error', 
          message: 'Property not found' 
        };
      }
      
      const county = await County.findById(countyId);
      if (!county) {
        return { 
          status: 'error', 
          message: 'County not found' 
        };
      }
      
      // Check if county has tax lien service configuration
      if (!county.metadata?.searchConfig?.lienUrl) {
        return {
          status: 'unknown',
          message: 'Tax lien check not available for this county'
        };
      }
      
      // If property already has tax lien information in the database, use that
      if (property.taxStatus?.taxLienStatus) {
        const isActive = property.taxStatus.taxLienStatus === 'Active';
        
        return {
          status: isActive ? 'lien' : 'clear',
          message: isActive 
            ? 'Property has an active tax lien' 
            : 'Property has no active tax liens',
          amount: property.taxStatus.taxLienAmount,
          date: property.taxStatus.taxLienDate?.toISOString(),
          details: {
            lastUpdated: property.taxStatus.lastUpdated,
            lastPaymentDate: property.taxStatus.lastPaymentDate
          }
        };
      }
      
      // No lien data in database, attempt external check if county has API configured
      try {
        const lienUrl = county.metadata.searchConfig.lienUrl;
        
        // Determine which identifier to use based on county configuration
        const searchMethod = county.metadata.searchConfig.lookupMethod || 'parcel_id';
        const searchParam = searchMethod === 'account_number' 
          ? (accountNumber || property.taxStatus?.accountNumber) 
          : (parcelId || property.location?.parcelId);
        
        if (!searchParam) {
          return {
            status: 'error',
            message: `Required ${searchMethod === 'account_number' ? 'account number' : 'parcel ID'} not available`
          };
        }
        
        // Call external tax lien API
        const response = await axios.get(lienUrl, {
          params: {
            [searchMethod === 'account_number' ? 'account' : 'parcel']: searchParam,
            county: county.name
          },
          timeout: 10000 // 10 second timeout
        });
        
        const data = response.data;
        
        // Process the response based on county-specific format
        if (data.hasLien === true) {
          return {
            status: 'lien',
            message: 'Property has an active tax lien',
            amount: data.lienAmount,
            date: data.lienDate,
            details: data.additionalInfo || {}
          };
        } else {
          return {
            status: 'clear',
            message: 'No active tax liens found'
          };
        }
      } catch (apiError) {
        console.error('External tax lien API error:', apiError);
        
        // Fall back to database status if API call fails
        return {
          status: 'unknown',
          message: 'Unable to verify tax lien status from external source'
        };
      }
    } catch (error) {
      console.error('Tax lien check error:', error);
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
} 