// @ts-nocheck
import { Router } from 'express';
import { PropertyService } from '../services/property.service';
import { CountyService } from '../services/county.service';
import { Parser } from 'json2csv';
import ExcelJS from 'exceljs';
import { PropertyObject } from '../types/inventory';
import { ExportService } from '../services/export.service';
import { Property } from '../models/property.model';
import { County } from '../models/county.model';
import express, { Request, Response } from 'express';
import { exportPropertiesToCSV, exportPropertiesToExcel, exportCountiesToCSV, exportCountiesToExcel } from '../services/export.service';
import { isStringObjectId } from '../utils/type-guards';
import { authorize } from '../middleware/roleAuth';

const router = Router();
const propertyService = new PropertyService();
const countyService = new CountyService();
const exportService = new ExportService();

// Roles that can access export functionality
const EXPORT_ROLES = ['admin', 'analyst', 'dataManager'];

/**
 * @swagger
 * /api/export/properties/csv:
 *   get:
 *     summary: Export properties to CSV format
 *     description: Download property data in CSV format with optional filtering
 *     tags:
 *       - Export
 *     parameters:
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Filter by state ID
 *       - in: query
 *         name: county
 *         schema:
 *           type: string
 *         description: Filter by county ID
 *       - in: query
 *         name: propertyType
 *         schema:
 *           type: string
 *         description: Filter by property type
 *       - in: query
 *         name: taxStatus
 *         schema:
 *           type: string
 *         description: Filter by tax status
 *       - in: query
 *         name: minValue
 *         schema:
 *           type: number
 *         description: Minimum market value filter
 *       - in: query
 *         name: maxValue
 *         schema:
 *           type: number
 *         description: Maximum market value filter
 *     responses:
 *       200:
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid filter parameters
 *       404:
 *         description: No properties found with the provided filters
 *       500:
 *         description: Server error
 */
router.get('/properties/csv', authorize(EXPORT_ROLES), async (req: Request, res: Response) => {
  try {
    // Validate query parameters
    const { state, county, propertyType, taxStatus, minValue, maxValue } = req.query;

    if (state && !isStringObjectId(state as string)) {
      return res.status(400).json({ error: 'Invalid state ID format' });
    }

    if (county && !isStringObjectId(county as string)) {
      return res.status(400).json({ error: 'Invalid county ID format' });
    }

    if (minValue && isNaN(Number(minValue))) {
      return res.status(400).json({ error: 'Invalid minimum value' });
    }

    if (maxValue && isNaN(Number(maxValue))) {
      return res.status(400).json({ error: 'Invalid maximum value' });
    }

    await exportPropertiesToCSV(req, res);
  } catch (error) {
    console.error('Error in properties CSV export route:', error);
    res.status(500).json({ error: 'Failed to export properties to CSV' });
  }
});

/**
 * @swagger
 * /api/export/properties/excel:
 *   get:
 *     summary: Export properties to Excel format
 *     description: Download property data in Excel format with optional filtering
 *     tags:
 *       - Export
 *     parameters:
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Filter by state ID
 *       - in: query
 *         name: county
 *         schema:
 *           type: string
 *         description: Filter by county ID
 *       - in: query
 *         name: propertyType
 *         schema:
 *           type: string
 *         description: Filter by property type
 *       - in: query
 *         name: taxStatus
 *         schema:
 *           type: string
 *         description: Filter by tax status
 *       - in: query
 *         name: minValue
 *         schema:
 *           type: number
 *         description: Minimum market value filter
 *       - in: query
 *         name: maxValue
 *         schema:
 *           type: number
 *         description: Maximum market value filter
 *     responses:
 *       200:
 *         description: Excel file download
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid filter parameters
 *       404:
 *         description: No properties found with the provided filters
 *       500:
 *         description: Server error
 */
router.get('/properties/excel', authorize(EXPORT_ROLES), async (req: Request, res: Response) => {
  try {
    // Validate query parameters
    const { state, county, propertyType, taxStatus, minValue, maxValue } = req.query;

    if (state && !isStringObjectId(state as string)) {
      return res.status(400).json({ error: 'Invalid state ID format' });
    }

    if (county && !isStringObjectId(county as string)) {
      return res.status(400).json({ error: 'Invalid county ID format' });
    }

    if (minValue && isNaN(Number(minValue))) {
      return res.status(400).json({ error: 'Invalid minimum value' });
    }

    if (maxValue && isNaN(Number(maxValue))) {
      return res.status(400).json({ error: 'Invalid maximum value' });
    }

    await exportPropertiesToExcel(req, res);
  } catch (error) {
    console.error('Error in properties Excel export route:', error);
    res.status(500).json({ error: 'Failed to export properties to Excel' });
  }
});

/**
 * @swagger
 * /api/export/counties/csv:
 *   get:
 *     summary: Export counties to CSV format
 *     description: Download county data in CSV format with optional filtering
 *     tags:
 *       - Export
 *     parameters:
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Filter by state ID
 *     responses:
 *       200:
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid filter parameters
 *       404:
 *         description: No counties found with the provided filters
 *       500:
 *         description: Server error
 */
router.get('/counties/csv', authorize(EXPORT_ROLES), async (req: Request, res: Response) => {
  try {
    // Validate query parameters
    const { state } = req.query;

    if (state && !isStringObjectId(state as string)) {
      return res.status(400).json({ error: 'Invalid state ID format' });
    }

    await exportCountiesToCSV(req, res);
  } catch (error) {
    console.error('Error in counties CSV export route:', error);
    res.status(500).json({ error: 'Failed to export counties to CSV' });
  }
});

/**
 * @swagger
 * /api/export/counties/excel:
 *   get:
 *     summary: Export counties to Excel format
 *     description: Download county data in Excel format with optional filtering
 *     tags:
 *       - Export
 *     parameters:
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Filter by state ID
 *     responses:
 *       200:
 *         description: Excel file download
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid filter parameters
 *       404:
 *         description: No counties found with the provided filters
 *       500:
 *         description: Server error
 */
router.get('/counties/excel', authorize(EXPORT_ROLES), async (req: Request, res: Response) => {
  try {
    // Validate query parameters
    const { state } = req.query;

    if (state && !isStringObjectId(state as string)) {
      return res.status(400).json({ error: 'Invalid state ID format' });
    }

    await exportCountiesToExcel(req, res);
  } catch (error) {
    console.error('Error in counties Excel export route:', error);
    res.status(500).json({ error: 'Failed to export counties to Excel' });
  }
});

/**
 * @swagger
 * /api/export/properties/direct-csv:
 *   post:
 *     summary: Export properties to CSV directly
 *     tags: [Exports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               countyId:
 *                 type: string
 *                 description: Filter by county ID
 *               propertyType:
 *                 type: string
 *                 description: Filter by property type
 *               taxStatus:
 *                 type: string
 *                 description: Filter by tax status
 *     responses:
 *       200:
 *         description: CSV file of properties
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Server error
 */
router.post('/properties/direct-csv', authorize(EXPORT_ROLES), async (req, res) => {
  try {
    const filters = req.body;
    
    let data = [];
    const fields = ['id', 'parcelId', 'taxAccountNumber', 'ownerName', 'propertyAddress', 'city', 'zipCode', 'taxStatus', 'assessedValue', 'marketValue', 'taxDue'];
    
    // Build query from filters
    const query: Record<string, any> = {};
    if (filters.countyId) {
      query.countyId = filters.countyId;
    }
    if (filters.propertyType) {
      query['metadata.propertyType'] = filters.propertyType;
    }
    if (filters.taxStatus) {
      query['taxStatus.status'] = filters.taxStatus;
    }
    
    // Get properties from database
    const properties = await Property.find(query).lean();
    
    // Transform data to match fields
    data = properties.map(prop => ({
      id: prop.id,
      parcelId: prop.location?.parcelId || '',
      taxAccountNumber: prop.taxStatus?.accountNumber || '',
      ownerName: prop.ownerName || '',
      propertyAddress: prop.address?.street || '',
      city: prop.address?.city || '',
      zipCode: prop.address?.zipCode || '',
      taxStatus: prop.taxStatus?.status || '',
      assessedValue: prop.taxStatus?.assessedValue || 0,
      marketValue: prop.taxStatus?.marketValue || 0,
      taxDue: prop.taxStatus?.annualTaxAmount || 0
    }));
    
    // Generate CSV
    const parser = new Parser({ fields });
    const csv = parser.parse(data);
    
    // Set response headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=properties_export_${new Date().toISOString().split('T')[0]}.csv`);
    
    // Send CSV data
    res.status(200).send(csv);
  } catch (error: any) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

/**
 * @swagger
 * /api/export/counties/direct-csv:
 *   post:
 *     summary: Export counties to CSV directly
 *     tags: [Exports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stateId:
 *                 type: string
 *                 description: Filter by state ID
 *     responses:
 *       200:
 *         description: CSV file of counties
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Server error
 */
router.post('/counties/direct-csv', authorize(EXPORT_ROLES), async (req, res) => {
  try {
    const filters = req.body;
    
    let data = [];
    const fields = ['id', 'name', 'state', 'totalProperties'];
    
    // Build query from filters
    const query: Record<string, any> = {};
    if (filters.stateId) {
      query.stateId = filters.stateId;
    }
    
    // Get counties from database
    const counties = await County.find(query).lean();
    
    // Transform data to match fields
    data = counties.map(county => ({
      id: county.id,
      name: county.name,
      state: county.stateId,
      totalProperties: county.metadata?.totalProperties || 0
    }));
    
    // Generate CSV
    const parser = new Parser({ fields });
    const csv = parser.parse(data);
    
    // Set response headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=counties_export_${new Date().toISOString().split('T')[0]}.csv`);
    
    // Send CSV data
    res.status(200).send(csv);
  } catch (error: any) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

/**
 * @swagger
 * /api/exports/{dataType}/csv:
 *   post:
 *     summary: Export data to CSV format
 *     tags: [Export]
 *     parameters:
 *       - in: path
 *         name: dataType
 *         schema:
 *           type: string
 *           enum: [properties, counties, states]
 *         required: true
 *         description: Type of data to export
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stateId:
 *                 type: string
 *                 description: Filter by state ID
 *               countyId:
 *                 type: string
 *                 description: Filter by county ID
 *               propertyType:
 *                 type: string
 *                 description: Filter by property type (for properties)
 *               taxStatus:
 *                 type: string
 *                 description: Filter by tax status (for properties)
 *               updatedAfter:
 *                 type: string
 *                 format: date-time
 *                 description: Filter by last update date
 *     responses:
 *       200:
 *         description: CSV data
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Server error
 */
router.post('/:dataType/csv', authorize(EXPORT_ROLES), async (req, res) => {
  try {
    const { dataType } = req.params;
    const filters = req.body;
    
    // Validate data type
    if (!['properties', 'counties', 'states'].includes(dataType)) {
      return res.status(400).json({
        message: `Invalid data type: ${dataType}. Must be one of: properties, counties, states`
      });
    }
    
    const csvData = await exportService.exportToCSV(dataType, filters);
    
    // Set response headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${dataType}_export_${new Date().toISOString().split('T')[0]}.csv`);
    
    // Send data
    res.send(csvData);
  } catch (error: any) {
    console.error('CSV export error:', error);
    res.status(500).json({ message: error.message || 'Failed to export data to CSV' });
  }
});

/**
 * @swagger
 * /api/exports/{dataType}/excel:
 *   post:
 *     summary: Export data to Excel format
 *     tags: [Export]
 *     parameters:
 *       - in: path
 *         name: dataType
 *         schema:
 *           type: string
 *           enum: [properties, counties, states]
 *         required: true
 *         description: Type of data to export
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stateId:
 *                 type: string
 *                 description: Filter by state ID
 *               countyId:
 *                 type: string
 *                 description: Filter by county ID
 *               propertyType:
 *                 type: string
 *                 description: Filter by property type (for properties)
 *               taxStatus:
 *                 type: string
 *                 description: Filter by tax status (for properties)
 *               updatedAfter:
 *                 type: string
 *                 format: date-time
 *                 description: Filter by last update date
 *     responses:
 *       200:
 *         description: Excel file
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Server error
 */
router.post('/:dataType/excel', authorize(EXPORT_ROLES), async (req, res) => {
  try {
    const { dataType } = req.params;
    const filters = req.body;
    
    // Validate data type
    if (!['properties', 'counties', 'states'].includes(dataType)) {
      return res.status(400).json({
        message: `Invalid data type: ${dataType}. Must be one of: properties, counties, states`
      });
    }
    
    const excelBuffer = await exportService.exportToExcel(dataType, filters);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${dataType}_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    // Send data
    res.send(excelBuffer);
  } catch (error: any) {
    console.error('Excel export error:', error);
    res.status(500).json({ message: error.message || 'Failed to export data to Excel' });
  }
});

/**
 * @swagger
 * /api/exports/{dataType}/json:
 *   post:
 *     summary: Export data to JSON format
 *     tags: [Export]
 *     parameters:
 *       - in: path
 *         name: dataType
 *         schema:
 *           type: string
 *           enum: [properties, counties, states]
 *         required: true
 *         description: Type of data to export
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stateId:
 *                 type: string
 *                 description: Filter by state ID
 *               countyId:
 *                 type: string
 *                 description: Filter by county ID
 *               propertyType:
 *                 type: string
 *                 description: Filter by property type (for properties)
 *               taxStatus:
 *                 type: string
 *                 description: Filter by tax status (for properties)
 *               updatedAfter:
 *                 type: string
 *                 format: date-time
 *                 description: Filter by last update date
 *     responses:
 *       200:
 *         description: JSON data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Server error
 */
router.post('/:dataType/json', authorize(EXPORT_ROLES), async (req, res) => {
  try {
    const { dataType } = req.params;
    const filters = req.body;
    
    // Validate data type
    if (!['properties', 'counties', 'states'].includes(dataType)) {
      return res.status(400).json({
        message: `Invalid data type: ${dataType}. Must be one of: properties, counties, states`
      });
    }
    
    const jsonData = await exportService.exportToJSON(dataType, filters);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${dataType}_export_${new Date().toISOString().split('T')[0]}.json`);
    
    // Send data
    res.send(jsonData);
  } catch (error: any) {
    console.error('JSON export error:', error);
    res.status(500).json({ message: error.message || 'Failed to export data to JSON' });
  }
});

/**
 * @swagger
 * /api/export/properties/enhanced/csv:
 *   post:
 *     summary: Export properties with enhanced fields to CSV format
 *     tags: [Exports]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stateId:
 *                 type: string
 *                 description: Filter by state ID
 *               countyId:
 *                 type: string
 *                 description: Filter by county ID
 *               propertyType:
 *                 type: string
 *                 description: Filter by property type
 *               taxStatus:
 *                 type: string
 *                 description: Filter by tax status
 *               minValue:
 *                 type: number
 *                 description: Filter by minimum market value
 *               maxValue:
 *                 type: number
 *                 description: Filter by maximum market value
 *     responses:
 *       200:
 *         description: CSV file of properties with enhanced fields
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       500:
 *         description: Server error
 */
router.post('/properties/enhanced/csv', authorize(EXPORT_ROLES), async (req, res) => {
  try {
    const filters = req.body;
    
    const csvData = await exportService.exportPropertiesToCsv([], filters);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=properties_export_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csvData);
  } catch (error: any) {
    console.error('Enhanced CSV export error:', error);
    res.status(500).json({ message: error.message || 'Failed to export properties to CSV' });
  }
});

/**
 * @swagger
 * /api/export/properties/enhanced/excel:
 *   post:
 *     summary: Export properties with enhanced fields to Excel format
 *     tags: [Exports]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stateId:
 *                 type: string
 *                 description: Filter by state ID
 *               countyId:
 *                 type: string
 *                 description: Filter by county ID
 *               propertyType:
 *                 type: string
 *                 description: Filter by property type
 *               taxStatus:
 *                 type: string
 *                 description: Filter by tax status
 *               minValue:
 *                 type: number
 *                 description: Filter by minimum market value
 *               maxValue:
 *                 type: number
 *                 description: Filter by maximum market value
 *     responses:
 *       200:
 *         description: Excel file of properties with enhanced fields
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         description: Server error
 */
router.post('/properties/enhanced/excel', authorize(EXPORT_ROLES), async (req, res) => {
  try {
    const filters = req.body;
    
    const excelBuffer = await exportService.exportPropertiesToExcel([], filters);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=properties_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    res.send(excelBuffer);
  } catch (error: any) {
    console.error('Enhanced Excel export error:', error);
    res.status(500).json({ message: error.message || 'Failed to export properties to Excel' });
  }
});

/**
 * @swagger
 * /api/export/counties/enhanced/csv:
 *   post:
 *     summary: Export counties with enhanced fields to CSV format
 *     tags: [Exports]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stateId:
 *                 type: string
 *                 description: Filter by state ID
 *               name:
 *                 type: string
 *                 description: Filter by county name (partial match)
 *     responses:
 *       200:
 *         description: CSV file of counties with enhanced fields
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       500:
 *         description: Server error
 */
router.post('/counties/enhanced/csv', authorize(EXPORT_ROLES), async (req, res) => {
  try {
    const filters = req.body;
    
    const csvData = await exportService.exportCountiesToCsv([], filters);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=counties_export_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csvData);
  } catch (error: any) {
    console.error('Enhanced CSV export error:', error);
    res.status(500).json({ message: error.message || 'Failed to export counties to CSV' });
  }
});

/**
 * @swagger
 * /api/export/counties/enhanced/excel:
 *   post:
 *     summary: Export counties with enhanced fields to Excel format
 *     tags: [Exports]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stateId:
 *                 type: string
 *                 description: Filter by state ID
 *               name:
 *                 type: string
 *                 description: Filter by county name (partial match)
 *     responses:
 *       200:
 *         description: Excel file of counties with enhanced fields
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         description: Server error
 */
router.post('/counties/enhanced/excel', authorize(EXPORT_ROLES), async (req, res) => {
  try {
    const filters = req.body;
    
    const excelBuffer = await exportService.exportCountiesToExcel([], filters);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=counties_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    res.send(excelBuffer);
  } catch (error: any) {
    console.error('Enhanced Excel export error:', error);
    res.status(500).json({ message: error.message || 'Failed to export counties to Excel' });
  }
});

export default router; 