import { createObjectCsvStringifier } from 'csv-writer';
import * as ExcelJS from 'exceljs';
import { Property } from '../models/property.model';
import { County } from '../models/county.model';
import { State } from '../models/state.model';
import { StateObject, CountyObject, PropertyObject } from '../types/inventory';

/**
 * Service for exporting data in various formats
 */
export class ExportService {
  /**
   * Export properties to CSV format with enhanced fields
   * @param properties Array of property objects to export
   * @param filters Optional filters to apply before export
   * @returns CSV formatted string
   */
  async exportPropertiesToCsv(properties: any[], filters: any = {}): Promise<string> {
    // If properties not provided, fetch them using filters
    if (!properties || properties.length === 0) {
      properties = await this.getPropertiesWithFilters(filters);
      
      if (properties.length === 0) {
        return 'No properties found matching the specified filters';
      }
    }
    
    const headers = [
      { id: 'id', title: 'ID' },
      { id: 'parcelId', title: 'Parcel ID' },
      { id: 'taxAccountNumber', title: 'Tax Account Number' },
      { id: 'ownerName', title: 'Owner Name' },
      { id: 'propertyAddress', title: 'Property Address' },
      { id: 'city', title: 'City' },
      { id: 'state', title: 'State' },
      { id: 'county', title: 'County' },
      { id: 'zipCode', title: 'ZIP Code' },
      { id: 'propertyType', title: 'Property Type' },
      { id: 'taxStatus', title: 'Tax Status' },
      { id: 'assessedValue', title: 'Assessed Value' },
      { id: 'marketValue', title: 'Market Value' },
      { id: 'taxDue', title: 'Tax Due' },
      { id: 'saleType', title: 'Sale Type' },
      { id: 'saleAmount', title: 'Sale Amount' },
      { id: 'saleDate', title: 'Sale Date' },
      { id: 'lastUpdated', title: 'Last Updated' },
      { id: 'name', title: 'Name' },
      { id: 'status', title: 'Status' },
      { id: 'condition', title: 'Condition' },
      { id: 'taxLienAmount', title: 'Tax Lien Amount' },
      { id: 'taxLienStatus', title: 'Tax Lien Status' },
      { id: 'yearBuilt', title: 'Year Built' },
      { id: 'squareFeet', title: 'Square Feet' },
      { id: 'bedrooms', title: 'Bedrooms' },
      { id: 'bathrooms', title: 'Bathrooms' },
      { id: 'latitude', title: 'Latitude' },
      { id: 'longitude', title: 'Longitude' },
      { id: 'createdAt', title: 'Created At' },
      { id: 'updatedAt', title: 'Updated At' }
    ];

    const csvStringifier = createObjectCsvStringifier({
      header: headers
    });

    const formattedProperties = properties.map(property => {
      return {
        id: property._id?.toString() || property.id,
        parcelId: property.parcelId || '',
        taxAccountNumber: property.taxAccountNumber || '',
        ownerName: property.ownerName || '',
        propertyAddress: property.propertyAddress || property.location?.address?.street || '',
        city: property.city || property.location?.address?.city || '',
        state: property.stateId?.abbreviation || property.location?.address?.state || '',
        county: property.countyId?.name || property.location?.address?.county || '',
        zipCode: property.zipCode || property.location?.address?.zipCode || '',
        propertyType: property.metadata?.propertyType || property.features?.type || '',
        taxStatus: property.metadata?.taxStatus || '',
        assessedValue: property.metadata?.assessedValue || property.taxStatus?.assessedValue || '',
        marketValue: property.metadata?.marketValue || property.taxStatus?.marketValue || '',
        taxDue: property.metadata?.taxDue || property.taxStatus?.annualTaxAmount || '',
        saleType: property.metadata?.saleType || '',
        saleAmount: property.metadata?.saleAmount || '',
        saleDate: property.metadata?.saleDate ? new Date(property.metadata.saleDate).toISOString().split('T')[0] : '',
        lastUpdated: property.metadata?.lastUpdated ? new Date(property.metadata.lastUpdated).toISOString().split('T')[0] : '',
        // Include existing fields to maintain compatibility
        name: property.name || '',
        status: property.status || '',
        condition: property.features?.condition || '',
        taxLienAmount: property.taxStatus?.taxLienAmount || '',
        taxLienStatus: property.taxStatus?.taxLienStatus || '',
        yearBuilt: property.features?.yearBuilt || '',
        squareFeet: property.features?.squareFeet || '',
        bedrooms: property.features?.bedrooms || '',
        bathrooms: property.features?.bathrooms || '',
        latitude: property.location?.coordinates?.latitude || '',
        longitude: property.location?.coordinates?.longitude || '',
        createdAt: property.createdAt ? new Date(property.createdAt).toISOString() : '',
        updatedAt: property.updatedAt ? new Date(property.updatedAt).toISOString() : ''
      };
    });

    return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(formattedProperties);
  }

  /**
   * Export properties to Excel format with enhanced fields
   * @param properties Array of property objects to export
   * @param filters Optional filters to apply before export
   * @returns Buffer containing Excel file data
   */
  async exportPropertiesToExcel(properties: any[], filters: any = {}): Promise<any> {
    // If properties not provided, fetch them using filters
    if (!properties || properties.length === 0) {
      properties = await this.getPropertiesWithFilters(filters);
      
      if (properties.length === 0) {
        throw new Error('No properties found matching the specified filters');
      }
    }
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Properties');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 28 },
      { header: 'Parcel ID', key: 'parcelId', width: 15 },
      { header: 'Tax Account Number', key: 'taxAccountNumber', width: 20 },
      { header: 'Owner Name', key: 'ownerName', width: 30 },
      { header: 'Property Address', key: 'propertyAddress', width: 40 },
      { header: 'City', key: 'city', width: 20 },
      { header: 'State', key: 'state', width: 10 },
      { header: 'County', key: 'county', width: 20 },
      { header: 'ZIP Code', key: 'zipCode', width: 10 },
      { header: 'Property Type', key: 'propertyType', width: 15 },
      { header: 'Tax Status', key: 'taxStatus', width: 15 },
      { header: 'Assessed Value', key: 'assessedValue', width: 15 },
      { header: 'Market Value', key: 'marketValue', width: 15 },
      { header: 'Tax Due', key: 'taxDue', width: 15 },
      { header: 'Sale Type', key: 'saleType', width: 15 },
      { header: 'Sale Amount', key: 'saleAmount', width: 15 },
      { header: 'Sale Date', key: 'saleDate', width: 12 },
      { header: 'Last Updated', key: 'lastUpdated', width: 12 },
      // Include original columns
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Condition', key: 'condition', width: 15 },
      { header: 'Tax Lien Amount', key: 'taxLienAmount', width: 15 },
      { header: 'Tax Lien Status', key: 'taxLienStatus', width: 15 },
      { header: 'Year Built', key: 'yearBuilt', width: 10 },
      { header: 'Square Feet', key: 'squareFeet', width: 12 },
      { header: 'Bedrooms', key: 'bedrooms', width: 10 },
      { header: 'Bathrooms', key: 'bathrooms', width: 10 },
      { header: 'Latitude', key: 'latitude', width: 12 },
      { header: 'Longitude', key: 'longitude', width: 12 },
      { header: 'Created At', key: 'createdAt', width: 20 },
      { header: 'Updated At', key: 'updatedAt', width: 20 }
    ];

    // Add header styling
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Add property data rows
    properties.forEach(property => {
      worksheet.addRow({
        id: property._id?.toString() || property.id,
        parcelId: property.parcelId || '',
        taxAccountNumber: property.taxAccountNumber || '',
        ownerName: property.ownerName || '',
        propertyAddress: property.propertyAddress || property.location?.address?.street || '',
        city: property.city || property.location?.address?.city || '',
        state: property.stateId?.abbreviation || property.location?.address?.state || '',
        county: property.countyId?.name || property.location?.address?.county || '',
        zipCode: property.zipCode || property.location?.address?.zipCode || '',
        propertyType: property.metadata?.propertyType || property.features?.type || '',
        taxStatus: property.metadata?.taxStatus || '',
        assessedValue: property.metadata?.assessedValue || property.taxStatus?.assessedValue || '',
        marketValue: property.metadata?.marketValue || property.taxStatus?.marketValue || '',
        taxDue: property.metadata?.taxDue || property.taxStatus?.annualTaxAmount || '',
        saleType: property.metadata?.saleType || '',
        saleAmount: property.metadata?.saleAmount || '',
        saleDate: property.metadata?.saleDate ? new Date(property.metadata.saleDate) : '',
        lastUpdated: property.metadata?.lastUpdated ? new Date(property.metadata.lastUpdated) : '',
        // Include original fields
        name: property.name || '',
        status: property.status || '',
        type: property.features?.type || '',
        condition: property.features?.condition || '',
        taxLienAmount: property.taxStatus?.taxLienAmount || '',
        taxLienStatus: property.taxStatus?.taxLienStatus || '',
        yearBuilt: property.features?.yearBuilt || '',
        squareFeet: property.features?.squareFeet || '',
        bedrooms: property.features?.bedrooms || '',
        bathrooms: property.features?.bathrooms || '',
        latitude: property.location?.coordinates?.latitude || '',
        longitude: property.location?.coordinates?.longitude || '',
        createdAt: property.createdAt ? new Date(property.createdAt) : '',
        updatedAt: property.updatedAt ? new Date(property.updatedAt) : ''
      });
    });

    // Style number columns
    const numberColumns = [
      'assessedValue', 'marketValue', 'taxDue', 'saleAmount',
      'taxLienAmount', 'yearBuilt', 'squareFeet', 'bedrooms', 'bathrooms',
      'latitude', 'longitude'
    ];
    
    numberColumns.forEach(colName => {
      worksheet.getColumn(colName).numFmt = '#,##0.00';
    });

    // Style date columns
    const dateColumns = ['saleDate', 'lastUpdated', 'createdAt', 'updatedAt'];
    dateColumns.forEach(colName => {
      worksheet.getColumn(colName).numFmt = 'yyyy-mm-dd';
    });

    return await workbook.xlsx.writeBuffer();
  }

  /**
   * Export county data to CSV format with enhanced fields
   * @param counties Array of county objects to export
   * @param filters Optional filters to apply before export 
   * @returns CSV formatted string
   */
  async exportCountiesToCsv(counties: any[], filters: any = {}): Promise<string> {
    // If counties not provided, fetch them using filters
    if (!counties || counties.length === 0) {
      counties = await this.getCountiesWithFilters(filters);
      
      if (counties.length === 0) {
        return 'No counties found matching the specified filters';
      }
    }
    
    const headers = [
      { id: 'id', title: 'ID' },
      { id: 'name', title: 'County Name' },
      { id: 'state', title: 'State' },
      { id: 'stateAbbreviation', title: 'State Abbreviation' },
      { id: 'totalProperties', title: 'Total Properties' },
      { id: 'totalTaxLiens', title: 'Total Tax Liens' },
      { id: 'totalValue', title: 'Total Value' },
      { id: 'lookupMethod', title: 'Lookup Method' },
      { id: 'searchUrl', title: 'Search URL' },
      { id: 'lienUrl', title: 'Lien URL' },
      { id: 'averagePropertyValue', title: 'Average Property Value' },
      { id: 'searchEnabled', title: 'Search Enabled' },
      { id: 'lastRun', title: 'Last Search Run' },
      { id: 'createdAt', title: 'Created At' },
      { id: 'updatedAt', title: 'Updated At' }
    ];

    const csvStringifier = createObjectCsvStringifier({
      header: headers
    });

    // Get parent state names if not already populated
    const stateIds = counties.filter(county => county.stateId || county.parentId)
                           .map(county => county.stateId || county.parentId);
    
    const uniqueStateIds = [...new Set(stateIds.map(id => id?.toString()))].filter(Boolean);
    const states = await State.find({ _id: { $in: uniqueStateIds } }).select('_id name abbreviation').lean();
    const stateMap = new Map(states.map(state => [state._id.toString(), state]));

    interface StateInfo {
      name: string;
      abbreviation: string;
    }

    const formattedCounties = counties.map(county => {
      const stateId = county.stateId?.toString() || county.parentId?.toString();
      const stateInfo = stateMap.get(stateId) || { name: '', abbreviation: '' } as StateInfo;
      
      return {
        id: county._id?.toString() || county.id,
        name: county.name,
        state: stateInfo.name || county.state || '',
        stateAbbreviation: stateInfo.abbreviation || '',
        totalProperties: county.metadata?.totalProperties || county.totalProperties || 0,
        totalTaxLiens: county.metadata?.statistics?.totalTaxLiens || county.totalTaxLiens || 0,
        totalValue: county.metadata?.statistics?.totalValue || county.totalValue || 0,
        lookupMethod: county.metadata?.searchConfig?.lookupMethod || '',
        searchUrl: county.metadata?.searchConfig?.searchUrl || '',
        lienUrl: county.metadata?.searchConfig?.lienUrl || '',
        // Include original fields
        averagePropertyValue: county.averagePropertyValue || 0,
        searchEnabled: county.searchEnabled || false,
        lastRun: county.lastRun ? new Date(county.lastRun).toISOString() : '',
        createdAt: county.createdAt ? new Date(county.createdAt).toISOString() : '',
        updatedAt: county.updatedAt ? new Date(county.updatedAt).toISOString() : ''
      };
    });

    return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(formattedCounties);
  }

  /**
   * Export county data to Excel format with enhanced fields
   * @param counties Array of county objects to export
   * @param filters Optional filters to apply before export
   * @returns Buffer containing Excel file data
   */
  async exportCountiesToExcel(counties: any[], filters: any = {}): Promise<any> {
    // If counties not provided, fetch them using filters
    if (!counties || counties.length === 0) {
      counties = await this.getCountiesWithFilters(filters);
      
      if (counties.length === 0) {
        throw new Error('No counties found matching the specified filters');
      }
    }
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Counties');
    
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 28 },
      { header: 'County Name', key: 'name', width: 30 },
      { header: 'State', key: 'state', width: 20 },
      { header: 'State Abbreviation', key: 'stateAbbreviation', width: 10 },
      { header: 'Total Properties', key: 'totalProperties', width: 15 },
      { header: 'Total Tax Liens', key: 'totalTaxLiens', width: 15 },
      { header: 'Total Value', key: 'totalValue', width: 15 },
      { header: 'Lookup Method', key: 'lookupMethod', width: 15 },
      { header: 'Search URL', key: 'searchUrl', width: 40 },
      { header: 'Lien URL', key: 'lienUrl', width: 40 },
      { header: 'Average Property Value', key: 'averagePropertyValue', width: 20 },
      { header: 'Search Enabled', key: 'searchEnabled', width: 15 },
      { header: 'Last Run', key: 'lastRun', width: 20 },
      { header: 'Created At', key: 'createdAt', width: 20 },
      { header: 'Updated At', key: 'updatedAt', width: 20 }
    ];
    
    // Apply header styling
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    
    // Get parent state names if not already populated
    const stateIds = counties.filter(county => county.stateId || county.parentId)
                           .map(county => county.stateId || county.parentId);
    
    const uniqueStateIds = [...new Set(stateIds.map(id => id?.toString()))].filter(Boolean);
    const states = await State.find({ _id: { $in: uniqueStateIds } }).select('_id name abbreviation').lean();
    const stateMap = new Map(states.map(state => [state._id.toString(), state]));
    
    interface StateInfo {
      name: string;
      abbreviation: string;
    }
    
    // Add data rows
    counties.forEach(county => {
      const stateId = county.stateId?.toString() || county.parentId?.toString();
      const stateInfo = stateMap.get(stateId) || { name: '', abbreviation: '' } as StateInfo;
      
      worksheet.addRow({
        id: county._id?.toString() || county.id,
        name: county.name,
        state: stateInfo.name || county.state || '',
        stateAbbreviation: stateInfo.abbreviation || '',
        totalProperties: county.metadata?.totalProperties || county.totalProperties || 0,
        totalTaxLiens: county.metadata?.statistics?.totalTaxLiens || county.totalTaxLiens || 0,
        totalValue: county.metadata?.statistics?.totalValue || county.totalValue || 0,
        lookupMethod: county.metadata?.searchConfig?.lookupMethod || '',
        searchUrl: county.metadata?.searchConfig?.searchUrl || '',
        lienUrl: county.metadata?.searchConfig?.lienUrl || '',
        // Include original fields
        averagePropertyValue: county.averagePropertyValue || 0,
        searchEnabled: county.searchEnabled || false,
        lastRun: county.lastRun ? new Date(county.lastRun) : '',
        createdAt: county.createdAt ? new Date(county.createdAt) : '',
        updatedAt: county.updatedAt ? new Date(county.updatedAt) : ''
      });
    });
    
    // Apply number formatting
    const numberColumns = ['totalProperties', 'totalTaxLiens', 'totalValue', 'averagePropertyValue'];
    numberColumns.forEach(column => {
      worksheet.getColumn(column).numFmt = '#,##0';
    });
    
    // Format date columns
    const dateColumns = ['lastRun', 'createdAt', 'updatedAt'];
    dateColumns.forEach(column => {
      worksheet.getColumn(column).numFmt = 'yyyy-mm-dd hh:mm:ss';
    });
    
    return await workbook.xlsx.writeBuffer();
  }

  /**
   * Export state data to CSV format
   * @param states Array of state objects to export
   * @returns CSV formatted string
   */
  async exportStatesToCsv(states: any[]): Promise<string> {
    const headers = [
      { id: 'id', title: 'ID' },
      { id: 'name', title: 'Name' },
      { id: 'abbreviation', title: 'Abbreviation' },
      { id: 'totalCounties', title: 'Total Counties' },
      { id: 'totalProperties', title: 'Total Properties' },
      { id: 'totalTaxLiens', title: 'Total Tax Liens' },
      { id: 'totalValue', title: 'Total Value' },
      { id: 'averagePropertyValue', title: 'Average Property Value' },
      { id: 'createdAt', title: 'Created At' },
      { id: 'updatedAt', title: 'Updated At' }
    ];

    const csvStringifier = createObjectCsvStringifier({
      header: headers
    });

    const formattedStates = states.map(state => {
      return {
        id: state.id,
        name: state.name,
        abbreviation: state.abbreviation,
        totalCounties: state.metadata?.totalCounties || 0,
        totalProperties: state.metadata?.totalProperties || 0,
        totalTaxLiens: state.metadata?.statistics?.totalTaxLiens || 0,
        totalValue: state.metadata?.statistics?.totalValue || 0,
        averagePropertyValue: state.metadata?.statistics?.averagePropertyValue || 0,
        createdAt: state.createdAt ? new Date(state.createdAt).toISOString() : '',
        updatedAt: state.updatedAt ? new Date(state.updatedAt).toISOString() : ''
      };
    });

    return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(formattedStates);
  }

  /**
   * Export state data to Excel format
   * @param states Array of state objects to export
   * @returns Buffer containing Excel file data
   */
  async exportStatesToExcel(states: any[]): Promise<any> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('States');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 20 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Abbreviation', key: 'abbreviation', width: 15 },
      { header: 'Total Counties', key: 'totalCounties', width: 15 },
      { header: 'Total Properties', key: 'totalProperties', width: 15 },
      { header: 'Total Tax Liens', key: 'totalTaxLiens', width: 15 },
      { header: 'Total Value', key: 'totalValue', width: 20 },
      { header: 'Average Property Value', key: 'averagePropertyValue', width: 20 },
      { header: 'Created At', key: 'createdAt', width: 20 },
      { header: 'Updated At', key: 'updatedAt', width: 20 }
    ];

    // Add header styling
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Add state data rows
    states.forEach(state => {
      worksheet.addRow({
        id: state.id,
        name: state.name,
        abbreviation: state.abbreviation,
        totalCounties: state.metadata?.totalCounties || 0,
        totalProperties: state.metadata?.totalProperties || 0,
        totalTaxLiens: state.metadata?.statistics?.totalTaxLiens || 0,
        totalValue: state.metadata?.statistics?.totalValue || 0,
        averagePropertyValue: state.metadata?.statistics?.averagePropertyValue || 0,
        createdAt: state.createdAt ? new Date(state.createdAt) : '',
        updatedAt: state.updatedAt ? new Date(state.updatedAt) : ''
      });
    });

    // Style number columns
    const numberColumns = [
      'totalCounties', 'totalProperties', 'totalTaxLiens', 'totalValue', 'averagePropertyValue'
    ];
    
    numberColumns.forEach(colName => {
      worksheet.getColumn(colName).numFmt = '#,##0.00';
    });

    // Style date columns
    const dateColumns = ['createdAt', 'updatedAt'];
    dateColumns.forEach(colName => {
      worksheet.getColumn(colName).numFmt = 'yyyy-mm-dd hh:mm:ss';
    });

    return await workbook.xlsx.writeBuffer();
  }

  /**
   * Get properties with filters applied
   * @param filters The filters to apply
   * @returns Array of filtered properties
   */
  async getPropertiesWithFilters(filters: any): Promise<any[]> {
    const query = this.buildPropertyFilterQuery(filters);
    
    return await Property.find(query)
      .populate('countyId', 'name')
      .populate('stateId', 'name abbreviation')
      .lean();
  }
  
  /**
   * Get counties with filters applied
   * @param filters The filters to apply
   * @returns Array of filtered counties
   */
  async getCountiesWithFilters(filters: any): Promise<any[]> {
    const query = this.buildCountyFilterQuery(filters);
    
    return await County.find(query)
      .populate('stateId', 'name abbreviation')
      .lean();
  }
  
  /**
   * Build query object for property filters
   * @param filters The filters to apply
   * @returns Mongoose query object
   */
  private buildPropertyFilterQuery(filters: any): any {
    const query: any = {};
    
    if (filters.stateId) {
      query.stateId = filters.stateId;
    }
    
    if (filters.countyId) {
      query.countyId = filters.countyId;
    }
    
    if (filters.propertyType) {
      query['metadata.propertyType'] = filters.propertyType;
    }
    
    if (filters.taxStatus) {
      query['metadata.taxStatus'] = filters.taxStatus;
    }
    
    if (filters.minValue || filters.maxValue) {
      query['metadata.marketValue'] = {};
      
      if (filters.minValue) {
        query['metadata.marketValue'].$gte = Number(filters.minValue);
      }
      
      if (filters.maxValue) {
        query['metadata.marketValue'].$lte = Number(filters.maxValue);
      }
    }
    
    return query;
  }
  
  /**
   * Build query object for county filters
   * @param filters The filters to apply
   * @returns Mongoose query object
   */
  private buildCountyFilterQuery(filters: any): any {
    const query: any = {};
    
    if (filters.stateId) {
      query.stateId = filters.stateId;
    }
    
    if (filters.name) {
      query.name = { $regex: filters.name, $options: 'i' };
    }
    
    return query;
  }

  /**
   * Get properties for a state
   * @param stateId State ID
   * @returns Array of property objects
   */
  async getPropertiesForState(stateId: string): Promise<any[]> {
    // Get all counties in this state
    const counties = await County.find({ parentId: stateId }).select('_id').lean();
    const countyIds = counties.map(county => county._id);
    
    // Get all properties in these counties
    return await Property.find({ parentId: { $in: countyIds } }).lean();
  }

  /**
   * Get properties for a county
   * @param countyId County ID
   * @returns Array of property objects
   */
  async getPropertiesForCounty(countyId: string): Promise<any[]> {
    return await Property.find({ parentId: countyId }).lean();
  }
} 