@echo off
cd %~dp0
echo =====================================
echo Quick Fix for API Docs and Dashboard
echo =====================================
echo.

echo 1. Installing Swagger dependencies...
call npm install swagger-jsdoc swagger-ui-express --save
call npm install @types/swagger-jsdoc @types/swagger-ui-express --save-dev
echo.

echo 2. Creating Swagger configuration file...
(
    echo // src/swagger.ts
    echo import swaggerJsdoc from 'swagger-jsdoc';
    echo import swaggerUi from 'swagger-ui-express';
    echo.
    echo const options = {
    echo   definition: {
    echo     openapi: '3.0.0',
    echo     info: {
    echo       title: 'Real Estate Investment Platform API',
    echo       version: '1.0.0',
    echo       description: 'API documentation for the Real Estate Investment Platform',
    echo     },
    echo     servers: [
    echo       {
    echo         url: 'http://localhost:3000',
    echo         description: 'Development server',
    echo       },
    echo     ],
    echo     components: {
    echo       securitySchemes: {
    echo         bearerAuth: {
    echo           type: 'http',
    echo           scheme: 'bearer',
    echo           bearerFormat: 'JWT',
    echo         },
    echo       },
    echo     },
    echo     security: [
    echo       {
    echo         bearerAuth: [],
    echo       },
    echo     ],
    echo   },
    echo   apis: ['./src/routes/*.ts', './src/models/*.ts'], // Path to the API docs
    echo };
    echo.
    echo export const specs = swaggerJsdoc(options^);
    echo export { swaggerUi };
) > src\swagger.ts
echo Swagger configuration file created.
echo.

echo 3. Updating .env file...
(
    echo PORT=3000
    echo MONGODB_URI=mongodb://localhost:27017/real-estate
    echo JWT_SECRET=your_strong_jwt_secret_key_change_in_production
    echo NODE_ENV=development
    echo SERVE_ADMIN_DASHBOARD=true
) > .env
echo .env file updated.
echo.

echo 4. Setting up restart script...
(
    echo @echo off
    echo cd %%~dp0
    echo echo Restarting server with API docs and admin dashboard...
    echo call npm run dev
) > restart.bat
echo Restart script created.
echo.

echo 5. Creating backup of index.ts...
copy src\index.ts src\index.ts.bak >nul
echo Backup created.
echo.

echo 6. Updating index.ts to include Swagger and admin dashboard...
(
    echo // @ts-nocheck
    echo import express, { Request, Response, NextFunction } from 'express';
    echo import mongoose from 'mongoose';
    echo import cors from 'cors';
    echo import dotenv from 'dotenv';
    echo import authRoutes from './routes/auth';
    echo import propertyRoutes from './routes/properties';
    echo import { specs, swaggerUi } from './swagger';
    echo import path from 'path';
    echo.
    echo // Load environment variables
    echo dotenv.config(^);
    echo.
    echo const app = express(^);
    echo const PORT = process.env.PORT ^|^| 3000;
    echo.
    echo // Middleware
    echo app.use(express.json(^)^);
    echo app.use(cors(^)^);
    echo.
    echo // Connect to MongoDB
    echo mongoose.connect(process.env.MONGODB_URI ^|^| 'mongodb://localhost:27017/real-estate'^)
    echo   .then(^(^) =^> console.log('Connected to MongoDB'^)^)
    echo   .catch(err =^> console.error('MongoDB connection error:', err^)^);
    echo.
    echo // API Routes
    echo app.use('/api/auth', authRoutes^);
    echo app.use('/api/properties', propertyRoutes^);
    echo.
    echo // Swagger API Documentation
    echo app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs^)^);
    echo.
    echo // Basic route for testing
    echo app.get('/', (req, res^) =^> {
    echo   res.send('Real Estate Platform API is running'^);
    echo }^);
    echo.
    echo // Serve static files for the admin dashboard if it exists
    echo if (process.env.SERVE_ADMIN_DASHBOARD === 'true'^) {
    echo   const adminDashboardPath = path.join(__dirname, '../../admin-dashboard/build'^);
    echo   app.use('/admin', express.static(adminDashboardPath^)^);
    echo   app.get('/admin/*', (req, res^) =^> {
    echo     res.sendFile(path.join(adminDashboardPath, 'index.html'^)^);
    echo   }^);
    echo   console.log('Admin dashboard is available at /admin'^);
    echo }
    echo.
    echo // Error handling middleware
    echo app.use((err: Error, req: Request, res: Response, next: NextFunction^) =^> {
    echo   console.error(err.stack^);
    echo   res.status(500^).json({
    echo     message: 'An unexpected error occurred',
    echo     error: process.env.NODE_ENV === 'development' ? err.message : undefined
    echo   }^);
    echo }^);
    echo.
    echo // Handle 404 routes
    echo app.use((req: Request, res: Response^) =^> {
    echo   res.status(404^).json({ message: 'Route not found' }^);
    echo }^);
    echo.
    echo // Start server
    echo const server = app.listen(PORT, (^) =^> {
    echo   console.log(`Server running on port ${PORT}`^);
    echo   console.log(`API Documentation available at: http://localhost:${PORT}/api-docs`^);
    echo   if (process.env.SERVE_ADMIN_DASHBOARD === 'true'^) {
    echo     console.log(`Admin Dashboard available at: http://localhost:${PORT}/admin`^);
    echo   }
    echo }^);
    echo.
    echo // Handle graceful shutdown
    echo process.on('SIGTERM', (^) =^> {
    echo   console.log('SIGTERM signal received.'^);
    echo   server.close((^) =^> {
    echo     console.log('Server closed.'^);
    echo     mongoose.connection.close(^).then((^) =^> {
    echo       console.log('MongoDB connection closed.'^);
    echo       process.exit(0^);
    echo     }^);
    echo   }^);
    echo }^);
    echo.
    echo // Handle uncaught exceptions
    echo process.on('uncaughtException', (err^) =^> {
    echo   console.error('Uncaught Exception:', err^);
    echo   // Keep the process running but log the error
    echo }^);
    echo.
    echo // Handle unhandled promise rejections
    echo process.on('unhandledRejection', (reason, promise^) =^> {
    echo   console.error('Unhandled Rejection at:', promise, 'reason:', reason^);
    echo   // Keep the process running but log the error
    echo }^);
    echo.
    echo export default app;
) > src\index.ts
echo index.ts updated.
echo.

echo Setup complete! Now restart your server using restart.bat to enable API docs and admin dashboard.
echo.
echo API will be available at: http://localhost:3000
echo API Docs will be available at: http://localhost:3000/api-docs
echo Admin Dashboard will be available at: http://localhost:3000/admin (if built)
echo.
echo Press any key to start the server...
pause > nul
call restart.bat 