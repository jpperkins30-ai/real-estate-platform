import { Property } from '../models/property.model';
import { County } from '../models/county.model';
import { State } from '../models/state.model';
import { Parser } from 'json2csv';
import ExcelJS from 'exceljs';

export class ExportService {
  /**
   * Process data and generate exports in different formats
   */
  
  /**
   * Export data to CSV format
   * @param dataType Type of data to export (properties, counties, etc.)
   * @param filters Filters to apply
   * @returns CSV data as string
   */
  async exportToCSV(dataType: string, filters: Record<string, any> = {}): Promise<string> {
    let data = [];
    let fields = [];
    
    // Get data based on type
    switch (dataType.toLowerCase()) {
      case 'properties':
        data = await this.fetchProperties(filters);
        fields = [
          'id', 
          'location.parcelId', 
          'taxStatus.accountNumber', 
          'ownerName', 
          'address.street', 
          'address.city', 
          'address.zipCode', 
          'taxStatus.status', 
          'taxStatus.assessedValue', 
          'taxStatus.marketValue', 
          'taxStatus.annualTaxAmount'
        ];
        break;
      case 'counties':
        data = await this.fetchCounties(filters);
        fields = [
          'id', 
          'name', 
          'stateId', 
          'metadata.totalProperties',
          'metadata.statistics.totalTaxLiens',
          'metadata.statistics.totalValue',
          'metadata.statistics.averagePropertyValue'
        ];
        break;
      case 'states':
        data = await this.fetchStates(filters);
        fields = [
          'id', 
          'name', 
          'abbreviation', 
          'metadata.totalProperties', 
          'metadata.totalCounties'
        ];
        break;
      default:
        throw new Error(`Unsupported data type: ${dataType}`);
    }
    
    if (data.length === 0) {
      return '';
    }
    
    // Generate CSV
    const parser = new Parser({ fields });
    const csv = parser.parse(data);
    
    return csv;
  }
  
  /**
   * Export data to Excel format
   * @param dataType Type of data to export (properties, counties, etc.)
   * @param filters Filters to apply
   * @returns Excel workbook as buffer
   */
  async exportToExcel(dataType: string, filters: Record<string, any> = {}): Promise<Buffer> {
    let data = [];
    let columns = [];
    
    // Get data based on type
    switch (dataType.toLowerCase()) {
      case 'properties':
        data = await this.fetchProperties(filters);
        columns = [
          { header: 'ID', key: 'id', width: 15 },
          { header: 'Parcel ID', key: 'parcelId', width: 15 },
          { header: 'Account Number', key: 'accountNumber', width: 15 },
          { header: 'Owner', key: 'ownerName', width: 20 },
          { header: 'Address', key: 'address', width: 30 },
          { header: 'City', key: 'city', width: 15 },
          { header: 'ZIP', key: 'zipCode', width: 10 },
          { header: 'Tax Status', key: 'taxStatus', width: 15 },
          { header: 'Assessed Value', key: 'assessedValue', width: 15 },
          { header: 'Market Value', key: 'marketValue', width: 15 },
          { header: 'Tax Due', key: 'taxDue', width: 15 }
        ];
        break;
      case 'counties':
        data = await this.fetchCounties(filters);
        columns = [
          { header: 'ID', key: 'id', width: 15 },
          { header: 'Name', key: 'name', width: 20 },
          { header: 'State', key: 'stateId', width: 10 },
          { header: 'Total Properties', key: 'totalProperties', width: 15 },
          { header: 'Total Tax Liens', key: 'totalLiens', width: 15 },
          { header: 'Total Value', key: 'totalValue', width: 15 },
          { header: 'Avg Property Value', key: 'avgValue', width: 15 }
        ];
        break;
      case 'states':
        data = await this.fetchStates(filters);
        columns = [
          { header: 'ID', key: 'id', width: 15 },
          { header: 'Name', key: 'name', width: 20 },
          { header: 'Abbreviation', key: 'abbreviation', width: 10 },
          { header: 'Total Properties', key: 'totalProperties', width: 15 },
          { header: 'Total Counties', key: 'totalCounties', width: 15 }
        ];
        break;
      default:
        throw new Error(`Unsupported data type: ${dataType}`);
    }
    
    if (data.length === 0) {
      throw new Error('No data found for export');
    }
    
    // Process data for Excel
    const processedData = this.processDataForExcel(data, dataType);
    
    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(dataType.charAt(0).toUpperCase() + dataType.slice(1));
    
    // Set columns
    worksheet.columns = columns;
    
    // Add rows
    processedData.forEach(item => {
      worksheet.addRow(item);
    });
    
    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Generate Excel buffer
    return await workbook.xlsx.writeBuffer();
  }
  
  /**
   * Export data to JSON format
   * @param dataType Type of data to export (properties, counties, etc.)
   * @param filters Filters to apply
   * @returns JSON string
   */
  async exportToJSON(dataType: string, filters: Record<string, any> = {}): Promise<string> {
    let data = [];
    
    // Get data based on type
    switch (dataType.toLowerCase()) {
      case 'properties':
        data = await this.fetchProperties(filters);
        break;
      case 'counties':
        data = await this.fetchCounties(filters);
        break;
      case 'states':
        data = await this.fetchStates(filters);
        break;
      default:
        throw new Error(`Unsupported data type: ${dataType}`);
    }
    
    if (data.length === 0) {
      return '[]';
    }
    
    return JSON.stringify(data, null, 2);
  }
  
  /**
   * Process data for Excel export based on data type
   */
  private processDataForExcel(data: any[], dataType: string): any[] {
    switch (dataType.toLowerCase()) {
      case 'properties':
        return data.map(property => ({
          id: property.id,
          parcelId: property.location?.parcelId || '',
          accountNumber: property.taxStatus?.accountNumber || '',
          ownerName: property.ownerName || '',
          address: property.address?.street || '',
          city: property.address?.city || '',
          zipCode: property.address?.zipCode || '',
          taxStatus: property.taxStatus?.status || '',
          assessedValue: property.taxStatus?.assessedValue || 0,
          marketValue: property.taxStatus?.marketValue || 0,
          taxDue: property.taxStatus?.annualTaxAmount || 0
        }));
      
      case 'counties':
        return data.map(county => ({
          id: county.id,
          name: county.name,
          stateId: county.stateId,
          totalProperties: county.metadata?.totalProperties || 0,
          totalLiens: county.metadata?.statistics?.totalTaxLiens || 0,
          totalValue: county.metadata?.statistics?.totalValue || 0,
          avgValue: county.metadata?.statistics?.averagePropertyValue || 0
        }));
      
      case 'states':
        return data.map(state => ({
          id: state.id,
          name: state.name,
          abbreviation: state.abbreviation,
          totalProperties: state.metadata?.totalProperties || 0,
          totalCounties: state.metadata?.totalCounties || 0
        }));
      
      default:
        return data;
    }
  }
  
  /**
   * Fetch properties with filters
   */
  private async fetchProperties(filters: Record<string, any>): Promise<any[]> {
    const query: Record<string, any> = {};
    
    // Apply filters
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
      query['taxStatus.status'] = filters.taxStatus;
    }
    
    // Handle date ranges
    if (filters.updatedAfter) {
      query.updatedAt = { $gte: new Date(filters.updatedAfter) };
    }
    
    const properties = await Property.find(query).lean();
    return properties;
  }
  
  /**
   * Fetch counties with filters
   */
  private async fetchCounties(filters: Record<string, any>): Promise<any[]> {
    const query: Record<string, any> = {};
    
    if (filters.stateId) {
      query.stateId = filters.stateId;
    }
    
    const counties = await County.find(query).lean();
    return counties;
  }
  
  /**
   * Fetch states with filters
   */
  private async fetchStates(filters: Record<string, any>): Promise<any[]> {
    const query: Record<string, any> = {};
    
    const states = await State.find(query).lean();
    return states;
  }
} 