import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

/**
 * Export data to CSV format
 * @param data Array of objects to export
 * @param filename Filename for the exported file
 * @returns Success status and file URL
 */
export const exportToCSV = async (data: any[], filename: string) => {
  try {
    const response = await axios.post(`${API_URL}/export/csv`, { data, filename });
    return {
      success: true,
      fileUrl: response.data.fileUrl,
      message: 'Data exported to CSV successfully'
    };
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return {
      success: false,
      message: 'Failed to export data to CSV'
    };
  }
};

/**
 * Export data to Excel format
 * @param data Array of objects to export
 * @param filename Filename for the exported file
 * @param sheetName Name of the worksheet (optional)
 * @returns Success status and file URL
 */
export const exportToExcel = async (data: any[], filename: string, sheetName?: string) => {
  try {
    const response = await axios.post(`${API_URL}/export/excel`, { 
      data, 
      filename,
      sheetName: sheetName || 'Data'
    });
    return {
      success: true,
      fileUrl: response.data.fileUrl,
      message: 'Data exported to Excel successfully'
    };
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return {
      success: false,
      message: 'Failed to export data to Excel'
    };
  }
};

/**
 * Export GeoJSON data
 * @param data GeoJSON data to export
 * @param filename Filename for the exported file
 * @returns Success status and file URL
 */
export const exportGeoJSON = async (data: any, filename: string) => {
  try {
    const response = await axios.post(`${API_URL}/export/geojson`, { data, filename });
    return {
      success: true,
      fileUrl: response.data.fileUrl,
      message: 'GeoJSON exported successfully'
    };
  } catch (error) {
    console.error('Error exporting GeoJSON:', error);
    return {
      success: false,
      message: 'Failed to export GeoJSON'
    };
  }
};

/**
 * Generate a report based on provided data and template
 * @param data Data for the report
 * @param templateId ID of the report template to use
 * @param format Output format (pdf, docx, html)
 * @param filename Filename for the exported file
 * @returns Success status and file URL
 */
export const generateReport = async (
  data: any, 
  templateId: string, 
  format: 'pdf' | 'docx' | 'html', 
  filename: string
) => {
  try {
    const response = await axios.post(`${API_URL}/export/report`, { 
      data, 
      templateId,
      format,
      filename
    });
    return {
      success: true,
      fileUrl: response.data.fileUrl,
      message: `Report generated successfully in ${format.toUpperCase()} format`
    };
  } catch (error) {
    console.error('Error generating report:', error);
    return {
      success: false,
      message: `Failed to generate ${format.toUpperCase()} report`
    };
  }
}; 