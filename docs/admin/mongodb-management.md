# MongoDB Collection Management in Admin Dashboard

## Overview

The Admin Dashboard provides functionality to manage MongoDB collections directly through the interface. This document explains how to use these features safely and effectively.

## Accessing Collection Management

1. Log in to the Admin Dashboard with admin credentials
2. Navigate to the Settings page
3. Select the "Database" tab to access MongoDB collection management

## Available Operations

### Viewing Collections

The dashboard displays all available collections in the MongoDB database with:
- Collection name
- Document count
- Size on disk
- Last updated timestamp

### Managing Collections

#### 1. Viewing Documents

To view documents in a collection:
1. Click on a collection name in the list
2. Use the search and filter options to find specific documents
3. Documents are displayed in a paginated table format

#### 2. Editing Documents

To edit a document:
1. Click the Edit icon next to a document
2. Modify the fields in the JSON editor
3. Click "Save Changes" to update the document in MongoDB
4. A confirmation dialog will appear to confirm the update

#### 3. Adding Documents

To add a new document:
1. Click the "Add Document" button above the collection view
2. Enter valid JSON for the new document in the editor
3. Click "Create" to add the document to the collection

#### 4. Deleting Documents

To delete a document:
1. Click the Delete icon next to a document
2. Confirm the deletion in the confirmation dialog

## Bulk Operations

The Admin Dashboard also supports bulk operations:

1. **Bulk Import**:
   - Click "Bulk Import" on the collection view
   - Upload a JSON file containing an array of documents
   - Review the import preview
   - Click "Import" to add the documents to the collection

2. **Bulk Export**:
   - Click "Export" on the collection view
   - Choose export format (JSON or CSV)
   - Select fields to include in the export
   - Click "Export" to download the collection data

## Safety Measures

To ensure database integrity, the following safety measures are implemented:

1. **Validation**:
   - Document validation against schema before saving
   - JSON syntax validation in the editor

2. **Permissions**:
   - Only admin users can access collection management
   - Read-only mode available for sensitive collections

3. **Audit Trail**:
   - All operations are logged with user, timestamp, and action
   - Audit logs available in the Admin Dashboard

## Best Practices

1. **Backup Before Changes**:
   - Always export a collection before making significant changes
   - Use the Git backup system for important milestones

2. **Limit Document Size**:
   - Avoid editing documents larger than 1MB through the interface
   - Use MongoDB Compass for complex document operations

3. **Sensitive Operations**:
   - Schedule bulk operations during low-traffic periods
   - Notify other administrators before making structural changes

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Document not saving | Check JSON validity and required fields |
| Slow document load | Add proper indexes to the collection |
| Import failure | Ensure JSON format is correct and documents match schema |
| Missing collections | Verify MongoDB connection and user permissions |

For additional support, consult the System Administrator or Database Administrator. 