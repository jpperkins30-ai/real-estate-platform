# Manual Start Instructions for Real Estate Platform

Since automated scripts are encountering issues, follow these manual steps to start and test the application.

## Branch Structure

The repository uses the following branches:
- `main` - Production code
- `develop` - Integration branch
- Feature branches:
  - `feature/inventory-consolidated` - Inventory and collector framework
  - `feature/export-consolidated` - Export functionality
  - `feature/map-consolidated` - Map visualization

## Starting the Application

### Step 1: Start the Server

1. Open a Command Prompt or PowerShell window
2. Navigate to the project directory:
   ```
   cd C:\Users\jpper\Documents\real-estate-platform\real-estate-platform
   ```
3. Navigate to the server directory:
   ```
   cd server
   ```
4. Run the development server:
   ```
   npm run dev
   ```
5. The server should start on http://localhost:4000

### Step 2: Start the Client

1. Open another Command Prompt or PowerShell window
2. Navigate to the project directory:
   ```
   cd C:\Users\jpper\Documents\real-estate-platform\real-estate-platform
   ```
3. Navigate to the client directory:
   ```
   cd client
   ```
4. Run the client application:
   ```
   npm start
   ```
5. The client should start on http://localhost:3000

## Testing Components

### Server Health Check

1. Open a web browser
2. Navigate to: http://localhost:4000/api/health
3. You should see a JSON response with server status

### Inventory Module

1. Open a web browser
2. Navigate to: http://localhost:3000/inventory
3. Follow the testing steps in TESTING-GUIDE.md for Inventory Module

### Collection Management

1. Open a web browser
2. Navigate to: http://localhost:3000/collection
3. Test the following features:
   - View collection history
   - Configure new collectors
   - Monitor collection progress
   - Review collected data
4. Follow the detailed steps in TESTING-GUIDE.md

### US Map Component

1. Open a web browser
2. Navigate to: http://localhost:3000/map
3. Follow the testing steps in TESTING-GUIDE.md for US Map Component

### Collector Wizard

1. Open a web browser
2. Navigate to: http://localhost:3000/wizard
3. Follow the testing steps in TESTING-GUIDE.md for Collector Wizard

## Troubleshooting

### Server Issues

If the server fails to start:
1. Check if MongoDB is running
2. Verify the .env file exists in the server directory with correct settings
3. Try running a simple Express server:
   ```
   cd server
   node src/simple-server.js
   ```

### Client Issues

If the client fails to start:
1. Check for errors in the console
2. Verify that the server is running before starting the client
3. Try clearing node_modules and reinstalling:
   ```
   cd client
   rm -rf node_modules
   npm install
   ```

## Manual API Testing

To test API endpoints with authorization:

1. Use a tool like Postman or curl
2. Include this admin token in the Authorization header:
   ```
   Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLXVzZXItaWQiLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwiaWF0IjoxNjI1NDQ5MTIwfQ.tO8SWH9lFgQMGRgxbVh8wd9W4Iq1LH-F_r9ZvEdf-xQ
   ```
3. Test these endpoints:
   - http://localhost:4000/api/inventory/properties
   - http://localhost:4000/api/usmap
   - http://localhost:4000/api/wizard/steps
   - http://localhost:4000/api/export/properties/csv

## Full Documentation

For comprehensive testing procedures, refer to:
- TESTING-GUIDE.md
- component-test-guide.md
- COMPONENTS-SUMMARY.md 