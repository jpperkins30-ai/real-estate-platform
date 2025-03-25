/**
 * Service for exporting data to different formats
 */
const exportService = {
  /**
   * Export data to CSV format
   * @param dataType Type of data to export (properties, counties, etc.)
   * @param filters Filters to apply to the data
   * @returns Promise indicating success
   */
  async exportToCSV(dataType: string, filters = {}) {
    try {
      // Request CSV export
      const response = await fetch(`/api/exports/${dataType}/csv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(filters)
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${dataType}_export_${new Date().toISOString().split('T')[0]}.csv`;
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return true;
    } catch (error) {
      console.error('CSV export error:', error);
      throw error;
    }
  },
  
  /**
   * Export data to Excel format
   * @param dataType Type of data to export (properties, counties, etc.)
   * @param filters Filters to apply to the data
   * @returns Promise indicating success
   */
  async exportToExcel(dataType: string, filters = {}) {
    try {
      // Request Excel export
      const response = await fetch(`/api/exports/${dataType}/excel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(filters)
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${dataType}_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return true;
    } catch (error) {
      console.error('Excel export error:', error);
      throw error;
    }
  },
  
  /**
   * Export data to JSON format
   * @param dataType Type of data to export (properties, counties, etc.)
   * @param filters Filters to apply to the data
   * @returns Promise indicating success
   */
  async exportToJSON(dataType: string, filters = {}) {
    try {
      // Request JSON export
      const response = await fetch(`/api/exports/${dataType}/json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(filters)
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${dataType}_export_${new Date().toISOString().split('T')[0]}.json`;
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return true;
    } catch (error) {
      console.error('JSON export error:', error);
      throw error;
    }
  },
  
  /**
   * Export data using direct CSV endpoint (optimized for specific data types)
   * @param dataType Type of data to export (properties or counties)
   * @param filters Filters to apply to the data
   * @returns Promise indicating success
   */
  async directExportToCSV(dataType: string, filters = {}) {
    try {
      // Request direct CSV export
      const response = await fetch(`/api/export/${dataType}/direct-csv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(filters)
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${dataType}_export_${new Date().toISOString().split('T')[0]}.csv`;
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return true;
    } catch (error) {
      console.error('Direct CSV export error:', error);
      throw error;
    }
  }
};

export default exportService; 