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
   * Export properties to CSV format
   * @param properties Array of property objects to export
   * @returns CSV formatted string
   */
  async exportPropertiesToCsv(properties: any[]): Promise<string> {
    const headers = [
      { id: 'id', title: 'ID' },
      { id: 'name', title: 'Name' },
      { id: 'address', title: 'Address' },
      { id: 'city', title: 'City' },
      { id: 'state', title: 'State' },
      { id: 'zipCode', title: 'Zip Code' },
      { id: 'county', title: 'County' },
      { id: 'status', title: 'Status' },
      { id: 'type', title: 'Type' },
      { id: 'condition', title: 'Condition' },
      { id: 'assessedValue', title: 'Assessed Value' },
      { id: 'marketValue', title: 'Market Value' },
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
        id: property.id,
        name: property.name,
        address: property.location?.address?.street || '',
        city: property.location?.address?.city || '',
        state: property.location?.address?.state || '',
        zipCode: property.location?.address?.zipCode || '',
        county: property.location?.address?.county || '',
        status: property.status || '',
        type: property.features?.type || '',
        condition: property.features?.condition || '',
        assessedValue: property.taxStatus?.assessedValue || '',
        marketValue: property.taxStatus?.marketValue || '',
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
   * Export properties to Excel format
   * @param properties Array of property objects to export
   * @returns Buffer containing Excel file data
   */
  async exportPropertiesToExcel(properties: any[]): Promise<Uint8Array> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Properties');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 20 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Address', key: 'address', width: 30 },
      { header: 'City', key: 'city', width: 20 },
      { header: 'State', key: 'state', width: 10 },
      { header: 'Zip Code', key: 'zipCode', width: 10 },
      { header: 'County', key: 'county', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Condition', key: 'condition', width: 15 },
      { header: 'Assessed Value', key: 'assessedValue', width: 15 },
      { header: 'Market Value', key: 'marketValue', width: 15 },
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

    // Add property data rows
    properties.forEach(property => {
      worksheet.addRow({
        id: property.id,
        name: property.name,
        address: property.location?.address?.street || '',
        city: property.location?.address?.city || '',
        state: property.location?.address?.state || '',
        zipCode: property.location?.address?.zipCode || '',
        county: property.location?.address?.county || '',
        status: property.status || '',
        type: property.features?.type || '',
        condition: property.features?.condition || '',
        assessedValue: property.taxStatus?.assessedValue || '',
        marketValue: property.taxStatus?.marketValue || '',
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
      'assessedValue', 'marketValue', 'taxLienAmount', 
      'yearBuilt', 'squareFeet', 'bedrooms', 'bathrooms',
      'latitude', 'longitude'
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
   * Export county data to CSV format
   * @param counties Array of county objects to export
   * @returns CSV formatted string
   */
  async exportCountiesToCsv(counties: any[]): Promise<string> {
    const headers = [
      { id: 'id', title: 'ID' },
      { id: 'name', title: 'Name' },
      { id: 'state', title: 'State' },
      { id: 'totalProperties', title: 'Total Properties' },
      { id: 'totalTaxLiens', title: 'Total Tax Liens' },
      { id: 'totalValue', title: 'Total Value' },
      { id: 'averagePropertyValue', title: 'Average Property Value' },
      { id: 'searchEnabled', title: 'Search Enabled' },
      { id: 'lastRun', title: 'Last Search Run' },
      { id: 'createdAt', title: 'Created At' },
      { id: 'updatedAt', title: 'Updated At' }
    ];

    const csvStringifier = createObjectCsvStringifier({
      header: headers
    });

    // Get parent state names
    const stateIds = [...new Set(counties.map(county => county.parentId))];
    const states = await State.find({ _id: { $in: stateIds } }).select('_id name').lean();
    const stateMap = new Map(states.map(state => [state._id.toString(), state.name]));

    const formattedCounties = counties.map(county => {
      return {
        id: county.id,
        name: county.name,
        state: stateMap.get(county.parentId.toString()) || county.parentId,
        totalProperties: county.metadata?.totalProperties || 0,
        totalTaxLiens: county.metadata?.statistics?.totalTaxLiens || 0,
        totalValue: county.metadata?.statistics?.totalValue || 0,
        averagePropertyValue: county.metadata?.statistics?.averagePropertyValue || 0,
        searchEnabled: county.searchConfig?.enabled ? 'Yes' : 'No',
        lastRun: county.searchConfig?.lastRun ? new Date(county.searchConfig.lastRun).toISOString() : '',
        createdAt: county.createdAt ? new Date(county.createdAt).toISOString() : '',
        updatedAt: county.updatedAt ? new Date(county.updatedAt).toISOString() : ''
      };
    });

    return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(formattedCounties);
  }

  /**
   * Export county data to Excel format
   * @param counties Array of county objects to export
   * @returns Buffer containing Excel file data
   */
  async exportCountiesToExcel(counties: any[]): Promise<Uint8Array> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Counties');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 20 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'State', key: 'state', width: 20 },
      { header: 'Total Properties', key: 'totalProperties', width: 15 },
      { header: 'Total Tax Liens', key: 'totalTaxLiens', width: 15 },
      { header: 'Total Value', key: 'totalValue', width: 20 },
      { header: 'Average Property Value', key: 'averagePropertyValue', width: 20 },
      { header: 'Search Enabled', key: 'searchEnabled', width: 15 },
      { header: 'Last Search Run', key: 'lastRun', width: 20 },
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

    // Get parent state names
    const stateIds = [...new Set(counties.map(county => county.parentId))];
    const states = await State.find({ _id: { $in: stateIds } }).select('_id name').lean();
    const stateMap = new Map(states.map(state => [state._id.toString(), state.name]));

    // Add county data rows
    counties.forEach(county => {
      worksheet.addRow({
        id: county.id,
        name: county.name,
        state: stateMap.get(county.parentId.toString()) || county.parentId,
        totalProperties: county.metadata?.totalProperties || 0,
        totalTaxLiens: county.metadata?.statistics?.totalTaxLiens || 0,
        totalValue: county.metadata?.statistics?.totalValue || 0,
        averagePropertyValue: county.metadata?.statistics?.averagePropertyValue || 0,
        searchEnabled: county.searchConfig?.enabled ? 'Yes' : 'No',
        lastRun: county.searchConfig?.lastRun ? new Date(county.searchConfig.lastRun) : '',
        createdAt: county.createdAt ? new Date(county.createdAt) : '',
        updatedAt: county.updatedAt ? new Date(county.updatedAt) : ''
      });
    });

    // Style number columns
    const numberColumns = [
      'totalProperties', 'totalTaxLiens', 'totalValue', 'averagePropertyValue'
    ];
    
    numberColumns.forEach(colName => {
      worksheet.getColumn(colName).numFmt = '#,##0.00';
    });

    // Style date columns
    const dateColumns = ['lastRun', 'createdAt', 'updatedAt'];
    dateColumns.forEach(colName => {
      worksheet.getColumn(colName).numFmt = 'yyyy-mm-dd hh:mm:ss';
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
  async exportStatesToExcel(states: any[]): Promise<Uint8Array> {
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