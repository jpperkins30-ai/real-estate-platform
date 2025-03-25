#!/bin/bash

# Install dependencies
echo "Installing dependencies..."
cd server && npm install json2csv exceljs --save
cd ..

# Add files to git
echo "Adding files to git..."
git add client/src/services/export.ts
git add client/src/components/common/DataExportButton.tsx
git add client/src/components/common/index.ts
git add client/src/services/index.ts
git add server/src/services/export.service.ts
git add server/src/routes/export.routes.ts
git add server/src/routes/index.ts

# Commit the changes
echo "Committing changes..."
git commit -m "feat(export): Add optimized direct CSV export functionality

Implement optimized direct CSV export for improved performance:

- Add direct-csv endpoints for properties and counties
- Implement efficient field mapping and transformation in backend routes
- Add directExportToCSV method to client export service
- Update DataExportButton to utilize direct export when available
- Maintain compatibility with the existing export system

This enhancement provides faster and more memory-efficient exports by directly
transforming database records into the expected CSV format without unnecessary
transformations. The direct export is particularly beneficial for large datasets
where the previous approach could cause performance issues."

echo "Changes committed successfully!" 