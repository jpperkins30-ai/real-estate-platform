import { Property } from '../types/inventory';

interface TaxLienCheckResult {
  status: 'clear' | 'lien' | 'unknown' | 'error';
  message: string;
  amount?: number;
  date?: string;
  details?: Record<string, any>;
}

/**
 * Service for checking property tax lien status
 */
const taxLienService = {
  /**
   * Check if a property has any tax liens
   * @param property Property to check
   * @returns Tax lien status information
   */
  async checkTaxLienStatus(property: Property): Promise<TaxLienCheckResult> {
    try {
      // Get county configuration
      const countyResponse = await fetch(`/api/counties/${property.parentId}`);
      if (!countyResponse.ok) {
        throw new Error('County not found');
      }
      
      const county = await countyResponse.json();
      const searchConfig = county.metadata.searchConfig;
      
      if (!searchConfig || !searchConfig.lienUrl) {
        return {
          status: 'unknown',
          message: 'Tax lien check not available for this county'
        };
      }
      
      // Check tax lien status
      const lienResponse = await fetch(`/api/tax-liens/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          propertyId: property.id,
          countyId: property.parentId,
          accountNumber: property.taxStatus.accountNumber,
          parcelId: property.location.parcelId
        })
      });
      
      if (!lienResponse.ok) {
        throw new Error('Tax lien check failed');
      }
      
      return await lienResponse.json();
    } catch (error) {
      console.error('Tax lien check error:', error);
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};

export default taxLienService; 