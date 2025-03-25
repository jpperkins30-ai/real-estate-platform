import { Router } from 'express';
import { PropertyService } from '../services/property.service';
import { CountyService } from '../services/county.service';
import { Parser } from 'json2csv';
import ExcelJS from 'exceljs';
import { PropertyObject } from '../types/inventory';

const router = Router();
const propertyService = new PropertyService();
const countyService = new CountyService();

/**
 * @swagger
 * /api/export/properties/csv:
 *   get:
 *     summary: Export properties to CSV
 *     tags: [Exports]
 *     parameters:
 *       - in: query
 *         name: filters
 *         schema:
 *           type: object
 *           properties:
 *             propertyTypes:
 *               type: array
 *               items:
 *                 type: string
 *             conditions:
 *               type: array
 *               items:
 *                 type: string
 *             statuses:
 *               type: array
 *               items:
 *                 type: string
 *             minValue:
 *               type: number
 *             maxValue:
 *               type: number
 *             counties:
 *               type: array
 *               items:
 *                 type: string
 *             states:
 *               type: array
 *               items:
 *                 type: string
 *     responses:
 *       200:
 *         description: CSV file of properties
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       500:
 *         description: Server error
 */
router.get('/properties/csv', async (req, res) => {
  try {
    const searchResponse = await propertyService.searchProperties(req.query);
    const properties = searchResponse.properties;
    
    // Define CSV fields
    const fields = [
      'id',
      'name',
      'status',
      'location.address.street',
      'location.address.city',
      'location.address.state',
      'location.address.zipCode',
      'location.address.county',
      'features.type',
      'features.condition',
      'features.yearBuilt',
      'features.squareFeet',
      'features.lotSize',
      'features.bedrooms',
      'features.bathrooms',
      'taxStatus.assessedValue',
      'taxStatus.marketValue',
      'taxStatus.taxRate',
      'taxStatus.annualTaxAmount',
      'taxStatus.taxLienAmount',
      'taxStatus.taxLienStatus'
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(properties);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=properties.csv');
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/export/properties/excel:
 *   get:
 *     summary: Export properties to Excel
 *     tags: [Exports]
 *     parameters:
 *       - in: query
 *         name: filters
 *         schema:
 *           type: object
 *           properties:
 *             propertyTypes:
 *               type: array
 *               items:
 *                 type: string
 *             conditions:
 *               type: array
 *               items:
 *                 type: string
 *             statuses:
 *               type: array
 *               items:
 *                 type: string
 *             minValue:
 *               type: number
 *             maxValue:
 *               type: number
 *             counties:
 *               type: array
 *               items:
 *                 type: string
 *             states:
 *               type: array
 *               items:
 *                 type: string
 *     responses:
 *       200:
 *         description: Excel file of properties
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *       500:
 *         description: Server error
 */
router.get('/properties/excel', async (req, res) => {
  try {
    const searchResponse = await propertyService.searchProperties(req.query);
    const properties = searchResponse.properties;
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Properties');

    // Define columns
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 15 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Street', key: 'street', width: 40 },
      { header: 'City', key: 'city', width: 20 },
      { header: 'State', key: 'state', width: 10 },
      { header: 'ZIP', key: 'zip', width: 10 },
      { header: 'County', key: 'county', width: 20 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Condition', key: 'condition', width: 15 },
      { header: 'Year Built', key: 'yearBuilt', width: 10 },
      { header: 'Square Feet', key: 'squareFeet', width: 12 },
      { header: 'Lot Size', key: 'lotSize', width: 12 },
      { header: 'Bedrooms', key: 'bedrooms', width: 10 },
      { header: 'Bathrooms', key: 'bathrooms', width: 10 },
      { header: 'Assessed Value', key: 'assessedValue', width: 15 },
      { header: 'Market Value', key: 'marketValue', width: 15 },
      { header: 'Tax Rate', key: 'taxRate', width: 10 },
      { header: 'Annual Tax', key: 'annualTax', width: 15 },
      { header: 'Tax Lien Amount', key: 'taxLienAmount', width: 15 },
      { header: 'Tax Lien Status', key: 'taxLienStatus', width: 15 }
    ];

    // Add data
    properties.forEach(property => {
      worksheet.addRow({
        id: property.id,
        name: property.name,
        status: property.status,
        street: property.location.address.street,
        city: property.location.address.city,
        state: property.location.address.state,
        zip: property.location.address.zipCode,
        county: property.location.address.county,
        type: property.features.type,
        condition: property.features.condition,
        yearBuilt: property.features.yearBuilt,
        squareFeet: property.features.squareFeet,
        lotSize: property.features.lotSize,
        bedrooms: property.features.bedrooms,
        bathrooms: property.features.bathrooms,
        assessedValue: property.taxStatus.assessedValue,
        marketValue: property.taxStatus.marketValue,
        taxRate: property.taxStatus.taxRate,
        annualTax: property.taxStatus.annualTaxAmount,
        taxLienAmount: property.taxStatus.taxLienAmount,
        taxLienStatus: property.taxStatus.taxLienStatus
      });
    });

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=properties.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/export/counties/csv:
 *   get:
 *     summary: Export counties to CSV
 *     tags: [Exports]
 *     responses:
 *       200:
 *         description: CSV file of counties
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       500:
 *         description: Server error
 */
router.get('/counties/csv', async (req, res) => {
  try {
    const counties = await countyService.getAllCounties();
    
    // Define CSV fields
    const fields = [
      'id',
      'name',
      'parentId',
      'metadata.totalProperties',
      'metadata.statistics.totalTaxLiens',
      'metadata.statistics.totalValue',
      'metadata.statistics.averagePropertyValue',
      'metadata.statistics.totalPropertiesWithLiens',
      'searchConfig.enabled',
      'searchConfig.lastRun',
      'searchConfig.nextScheduledRun'
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(counties);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=counties.csv');
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/export/counties/excel:
 *   get:
 *     summary: Export counties to Excel
 *     tags: [Exports]
 *     responses:
 *       200:
 *         description: Excel file of counties
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *       500:
 *         description: Server error
 */
router.get('/counties/excel', async (req, res) => {
  try {
    const counties = await countyService.getAllCounties();
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Counties');

    // Define columns
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 15 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'State ID', key: 'parentId', width: 15 },
      { header: 'Total Properties', key: 'totalProperties', width: 15 },
      { header: 'Total Tax Liens', key: 'totalTaxLiens', width: 15 },
      { header: 'Total Value', key: 'totalValue', width: 15 },
      { header: 'Average Property Value', key: 'averagePropertyValue', width: 20 },
      { header: 'Properties with Liens', key: 'propertiesWithLiens', width: 20 },
      { header: 'Search Enabled', key: 'searchEnabled', width: 15 },
      { header: 'Last Search Run', key: 'lastSearchRun', width: 20 },
      { header: 'Next Search Run', key: 'nextSearchRun', width: 20 }
    ];

    // Add data
    counties.forEach(county => {
      worksheet.addRow({
        id: county.id,
        name: county.name,
        parentId: county.parentId,
        totalProperties: county.metadata.totalProperties,
        totalTaxLiens: county.metadata.statistics.totalTaxLiens,
        totalValue: county.metadata.statistics.totalValue,
        averagePropertyValue: county.metadata.statistics.averagePropertyValue,
        propertiesWithLiens: county.metadata.statistics.totalPropertiesWithLiens,
        searchEnabled: county.searchConfig.enabled,
        lastSearchRun: county.searchConfig.lastRun,
        nextSearchRun: county.searchConfig.nextScheduledRun
      });
    });

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=counties.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 