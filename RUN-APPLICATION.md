# Running the Real Estate Platform Application

This document provides instructions for setting up and running the Real Estate Platform application.

## Prerequisites

Before running the application, ensure you have the following installed:

1. Node.js (v14 or higher)
2. npm (v6 or higher)
3. MongoDB (running on localhost:27017 or configured in your .env file)

## Running the Application

### Option 1: Using the Provided Scripts (Easiest)

#### For Windows:

1. Open Command Prompt or PowerShell
2. Navigate to the project root directory
3. Run one of the following commands:

   **Using Command Prompt:**
   ```
   run-app.bat
   ```

   **Using PowerShell:**
   ```
   .\run-app.ps1
   ```

This will start both the server and client applications in separate windows.

### Option 2: Manual Setup

If the scripts don't work, you can start each component manually:

#### Step 1: Start the Server

1. Open a terminal
2. Navigate to the server directory:
   ```
   cd server
   ```
3. Install dependencies (first time only):
   ```
   npm install
   ```
4. Start the server:
   ```
   npm run dev
   ```
5. The server should start on http://localhost:4000

#### Step 2: Start the Client

1. Open another terminal
2. Navigate to the client directory:
   ```
   cd client
   ```
3. Install dependencies (first time only):
   ```
   npm install
   ```
4. Start the client:
   ```
   npm run dev
   ```
5. The client should start on http://localhost:5173 and open in your default browser

## Important URLs

- **Backend API**: http://localhost:4000
- **Frontend UI**: http://localhost:5173
- **Swagger API Documentation**: http://localhost:4000/api-docs

## Troubleshooting

### Port Conflicts

If you encounter port conflicts:

1. For the server: Edit the `PORT` value in `server/.env`
2. For the client: Edit the server proxy in `client/vite.config.ts` to match the server port

### MongoDB Connection Issues

Ensure MongoDB is running with:
```
mongod --dbpath /path/to/data/directory
```

Or check your connection string in `server/.env`

### Node.js or npm Errors

- Ensure you're using compatible versions of Node.js and npm
- Try deleting `node_modules` folders and running `npm install` again in both server and client directories 