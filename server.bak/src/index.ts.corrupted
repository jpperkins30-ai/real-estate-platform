@echo off
echo Creating backup of corrupted index.ts file...
copy src\index.ts src\index.ts.corrupted

echo Creating new index.ts file...
echo // src/index.ts > src\index.ts
echo import express from 'express'; >> src\index.ts
echo import cors from 'cors'; >> src\index.ts
echo import mongoose from 'mongoose'; >> src\index.ts
echo import swaggerUi from 'swagger-ui-express'; >> src\index.ts
echo import swaggerJsDoc from 'swagger-jsdoc'; >> src\index.ts
echo import dotenv from 'dotenv'; >> src\index.ts
echo import * as authRoutes from './routes/auth'; >> src\index.ts
echo import propertyRoutes from './routes/properties'; >> src\index.ts
echo import helmet from 'helmet'; >> src\index.ts
echo import morgan from 'morgan'; >> src\index.ts
echo import path from 'path'; >> src\index.ts
echo. >> src\index.ts
echo // Load environment variables >> src\index.ts
echo dotenv.config(); >> src\index.ts
echo. >> src\index.ts
echo const app = express(); >> src\index.ts
echo const PORT = process.env.PORT || 3000; >> src\index.ts
echo. >> src\index.ts
echo // Middleware >> src\index.ts
echo app.use(express.json()); >> src\index.ts
echo app.use(cors()); >> src\index.ts
echo app.use(helmet()); >> src\index.ts
echo app.use(morgan('dev')); >> src\index.ts
echo. >> src\index.ts
echo // Swagger config >> src\index.ts
echo const swaggerOptions = { >> src\index.ts
echo   definition: { >> src\index.ts
echo     openapi: '3.0.0', >> src\index.ts
echo     info: { >> src\index.ts
echo       title: 'Real Estate Platform API', >> src\index.ts
echo       version: '1.0.0', >> src\index.ts
echo       description: 'API for managing real estate properties and transactions', >> src\index.ts
echo     }, >> src\index.ts
echo     servers: [{ url: `http://localhost:${PORT}` }], >> src\index.ts
echo     components: { >> src\index.ts
echo       securitySchemes: { >> src\index.ts
echo         bearerAuth: { >> src\index.ts
echo           type: 'http', >> src\index.ts
echo           scheme: 'bearer', >> src\index.ts
echo           bearerFormat: 'JWT', >> src\index.ts
echo         }, >> src\index.ts
echo       }, >> src\index.ts
echo     }, >> src\index.ts
echo   }, >> src\index.ts
echo   apis: ['./src/routes/*.ts'], >> src\index.ts
echo }; >> src\index.ts
echo. >> src\index.ts
echo const swaggerDocs = swaggerJsDoc(swaggerOptions); >> src\index.ts
echo app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs)); >> src\index.ts
echo. >> src\index.ts
echo // Connect to MongoDB >> src\index.ts
echo mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate') >> src\index.ts
echo   .then(() => console.log('Connected to MongoDB')) >> src\index.ts
echo   .catch(err => console.error('MongoDB connection error:', err)); >> src\index.ts
echo. >> src\index.ts
echo // API Routes >> src\index.ts
echo app.use('/api/auth', authRoutes); >> src\index.ts
echo app.use('/api/properties', propertyRoutes); >> src\index.ts
echo. >> src\index.ts
echo // Serve static assets in production >> src\index.ts
echo if (process.env.NODE_ENV === 'production') { >> src\index.ts
echo   app.use(express.static(path.join(__dirname, '../../client/build'))); >> src\index.ts
echo   app.get('*', (req, res) => { >> src\index.ts
echo     res.sendFile(path.resolve(__dirname, '../../client/build', 'index.html')); >> src\index.ts
echo   }); >> src\index.ts
echo } >> src\index.ts
echo. >> src\index.ts
echo // Start server >> src\index.ts
echo const server = app.listen(PORT, () => { >> src\index.ts
echo   console.log(`Server running on port ${PORT}`); >> src\index.ts
echo }); >> src\index.ts
echo. >> src\index.ts
echo // Handle graceful shutdown >> src\index.ts
echo process.on('SIGTERM', () => { >> src\index.ts
echo   console.log('SIGTERM signal received.'); >> src\index.ts
echo   server.close(() => { >> src\index.ts
echo     console.log('Server closed.'); >> src\index.ts
echo     mongoose.connection.close().then(() => { >> src\index.ts
echo       console.log('MongoDB connection closed.'); >> src\index.ts
echo       process.exit(0); >> src\index.ts
echo     }); >> src\index.ts
echo   }); >> src\index.ts
echo }); >> src\index.ts
echo. >> src\index.ts
echo // Handle uncaught exceptions >> src\index.ts
echo process.on('uncaughtException', (err) => { >> src\index.ts
echo   console.error('Uncaught Exception:', err); >> src\index.ts
echo   // Keep the process running but log the error >> src\index.ts
echo }); >> src\index.ts
echo. >> src\index.ts
echo // Handle unhandled promise rejections >> src\index.ts
echo process.on('unhandledRejection', (reason, promise) => { >> src\index.ts
echo   console.error('Unhandled Rejection at:', promise, 'reason:', reason); >> src\index.ts
echo   // Keep the process running but log the error >> src\index.ts
echo }); >> src\index.ts
echo. >> src\index.ts
echo export default app; >> src\index.ts

echo Index.ts file has been replaced with a clean version.
echo You can now run 'npm run dev' to start the server.