# Logs Dashboard Guide

This guide provides detailed information on using the Logs Dashboard in the Real Estate Platform admin interface for monitoring, analyzing, and managing system logs.

## Overview

The Logs Dashboard offers a comprehensive visualization and analysis tool for system logs, allowing administrators to:

- Monitor application health and performance
- Identify and troubleshoot errors
- Track user activity and system usage
- Analyze trends in system behavior
- Download log files for external analysis

## Accessing the Logs Dashboard

1. Log in to the Admin Dashboard with your administrator credentials
2. Navigate to the sidebar menu
3. Click on "Logs" to access the Logs Dashboard

## Dashboard Interface

![Logs Dashboard Interface](../public/assets/docs/logs-dashboard.png)

The Logs Dashboard consists of several key sections:

1. **Filter Controls** - Located at the top of the page
2. **Summary Cards** - Key metrics displayed prominently
3. **Data Visualizations** - Charts and graphs showing log data
4. **Log File Manager** - For accessing and downloading raw log files

## Filter Controls

The filter controls allow you to narrow down the log data to specific criteria:

### Date Range Selector

- **From Date** - Select the starting date for your analysis period
- **To Date** - Select the ending date for your analysis period
- **Quick Selectors** - Buttons for common time ranges (Today, Last 7 days, Last 30 days)

### Log Level Filter

A dropdown menu to filter logs by severity level:
- **All Levels** - Show logs of all levels
- **Error** - Show only error logs
- **Warning** - Show only warning logs
- **Info** - Show only informational logs
- **HTTP** - Show only HTTP request logs
- **Debug** - Show only debug logs

### Collection Filter

Filter logs related to specific database collections:
- **All Collections** - Show logs for all collections
- **Users** - Show logs related to user operations
- **Properties** - Show logs related to property operations
- **Listings** - Show logs related to listing operations
- **Transactions** - Show logs related to transaction operations
- **Messages** - Show logs related to messaging operations

### User ID Filter

- Enter a user ID to see logs related to a specific user
- Useful for tracking user activity or troubleshooting user-specific issues

### Message Search

- Enter text to search within log messages
- Supports partial matching (case-insensitive)
- Useful for finding specific errors or events

### Apply Filters Button

After setting your filters, click the "Apply Filters" button to update the dashboard with filtered data.

## Summary Cards

The summary cards provide at-a-glance metrics about your log data:

### Total Log Entries

- Shows the total number of log entries matching your current filters
- Indicates the volume of system activity

### Error Rate

- Displays the percentage of logs that are errors
- Includes a color indicator (green: <1%, yellow: 1-5%, red: >5%)
- Helps quickly identify if there's a concerning level of errors

### Most Active Collection

- Shows which database collection has the most operations
- Includes the percentage of total operations
- Helps identify which parts of the system are most active

### Latest Error

- Displays the most recent error message
- Includes timestamp and related collection/user if available
- Provides quick access to understand recent issues

## Data Visualizations

The dashboard includes several interactive charts and graphs:

### Daily Log Volume

- Bar chart showing log volume by day
- Color-coded by log level
- Hover for detailed counts
- Helps identify unusual spikes in activity or errors

### Log Level Distribution

- Pie chart showing distribution of logs by level
- Shows the proportion of errors, warnings, etc.
- Hover for exact percentages and counts
- Helps understand the overall system health

### Collection Operations

- Bar chart showing database operations by collection
- Color-coded by operation type (create, read, update, delete)
- Hover for detailed counts
- Helps understand which collections are most active

### Top Error Messages

- Bar chart of most frequent error messages
- Shows count and percentage of total errors
- Hover for full error message text
- Helps identify the most common issues to address

## Log Viewer

Below the visualizations, you'll find a paginated log viewer that shows the actual log entries matching your filters:

### Column Headers

- **Timestamp** - When the log was recorded
- **Level** - The log level (error, warning, info, etc.)
- **Message** - The log message text
- **User ID** - The user associated with the log (if any)
- **Collection** - The database collection (if applicable)
- **Details** - Additional metadata about the log entry

### Pagination Controls

- Navigate between pages of log entries
- Select number of entries per page (10, 25, 50, 100)
- Shows total number of entries and current page

### Expandable Rows

Click on any log entry to expand it and see the full details, including:
- Complete stack trace for errors
- Request and response data for HTTP logs
- All metadata associated with the log

## Log File Manager

The Log File Manager section allows you to access and download raw log files:

### Available Log Files

- Table showing available log files
- Columns include filename, size, creation date, and last modified date
- Sortable by any column
- Search box to filter by filename

### Download Options

For each log file:
- **Download** button - Download the log file directly
- **View** button - Preview the log file in the browser (first 1000 lines)

### Log Maintenance

If your role includes sufficient permissions:
- **Clean Logs** button - Access the log cleaning interface
- **Compress Logs** button - Manually compress older logs to save space

## Using the Dashboard Effectively

### Troubleshooting Errors

To investigate application errors:
1. Set the Log Level filter to "Error"
2. Use the Date Range to focus on the relevant time period
3. Check the Top Error Messages chart to identify common patterns
4. Click on specific error entries in the log viewer to see full details
5. Use the Message Search to find similar errors

### Monitoring System Health

For regular system health checks:
1. Set Date Range to "Last 7 days"
2. Look at the Error Rate card for any concerning trends
3. Check the Daily Log Volume chart for unusual spikes
4. Review the Most Active Collection to ensure expected usage patterns
5. Check the Log Level Distribution to ensure errors remain a small percentage

### User Activity Tracking

To track a specific user's activity:
1. Enter their User ID in the User ID filter
2. Expand the Date Range to cover the relevant period
3. Review all log entries in the log viewer
4. Look for patterns in collections accessed and operations performed

### Performance Monitoring

To monitor system performance:
1. Set the Collection filter to focus on performance-critical collections
2. Look at the Daily Log Volume to identify high-traffic periods
3. Check for correlations between high volume and increased error rates
4. Download relevant log files for more detailed analysis

## Exporting Data

Several options are available for exporting data from the Logs Dashboard:

### Chart Exports

Each chart has an export menu in the top-right corner:
- **PNG Image** - Export the chart as a PNG image
- **SVG Vector** - Export the chart as an SVG vector image
- **CSV Data** - Export the underlying data as CSV

### Log Data Exports

- **Export Filtered Logs** button - Export currently filtered logs as JSON or CSV
- **Download Log Files** - Download raw log files for external analysis

## Advanced Features

### Custom Date Formats

Click the gear icon in the Date Range selector to customize the date format according to your preference.

### Saved Filters

Save commonly used filter combinations:
1. Set up your desired filters
2. Click "Save Filter Set" button
3. Give your filter set a name
4. Access saved filter sets from the dropdown menu

### Automatic Refresh

Enable automatic dashboard refresh:
1. Click the refresh icon in the top-right corner
2. Select refresh interval (30s, 1m, 5m, 15m, 30m, 1h)
3. Dashboard will automatically update at the selected interval

## Keyboard Shortcuts

The Logs Dashboard supports several keyboard shortcuts:
- **F** - Focus on filters
- **R** - Refresh data
- **D** - Change date range
- **E** - Export data
- **L** - Focus on log viewer
- **?** - Show keyboard shortcuts help

## Best Practices

1. **Regular Monitoring**
   - Check the Logs Dashboard daily for error spikes
   - Set up a routine to review key metrics

2. **Focused Troubleshooting**
   - Use filters strategically to isolate issues
   - Start with broad filters and gradually narrow down

3. **Collaborative Analysis**
   - Use the export features to share findings with team members
   - Save specific filter sets for common investigations

4. **Log Maintenance**
   - Regularly clean old logs to maintain system performance
   - Download important logs before cleaning for record-keeping

5. **Performance Considerations**
   - Avoid very wide date ranges when unnecessary
   - Use specific filters when possible to improve dashboard performance

## Getting Help

If you encounter issues with the Logs Dashboard:

1. Check the tooltip help icons next to each dashboard element
2. Refer to this guide for detailed instructions
3. Contact system administration at admin@example.com
4. For urgent issues, call the support hotline at 555-123-4567 