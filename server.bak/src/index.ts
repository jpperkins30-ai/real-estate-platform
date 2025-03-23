   // @ts-nocheck
   import express from 'express';
   import mongoose from 'mongoose';
   import cors from 'cors';
   import dotenv from 'dotenv';
   import swaggerUi from 'swagger-ui-express';
   import swaggerJsDoc from 'swagger-jsdoc';
   import * as authRoutes from './routes/auth';
   import propertyRoutes from './routes/properties';
   
   // Load environment variables
   dotenv.config();
   
   const app = express();
   const PORT = process.env.PORT || 3000;
   
   // Middleware
   app.use(express.json());
   app.use(cors());
   
   // Swagger config
   const swaggerOptions = {
     definition: {
       openapi: '3.0.0',
       info: {
         title: 'Real Estate Platform API',
         version: '1.0.0',
         description: 'API for managing real estate properties and transactions',
       },
       servers: [{ url: `http://localhost:${PORT}` }],
       components: {
         securitySchemes: {
           bearerAuth: {
             type: 'http',
             scheme: 'bearer',
             bearerFormat: 'JWT',
           },
         },
       },
     },
     apis: ['./src/routes/*.ts'],
   };
   
   const swaggerDocs = swaggerJsDoc(swaggerOptions);
   app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
   
   // Connect to MongoDB
   mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate')
     .then(() => console.log('Connected to MongoDB'))
     .catch(err => console.error('MongoDB connection error:', err));
   
   // API Routes
   app.use('/api/auth', authRoutes);
   app.use('/api/properties', propertyRoutes);
   
   // Start server
   const server = app.listen(PORT, () => {
     console.log(`Server running on port ${PORT}`);
   });
   
   // Handle graceful shutdown
   process.on('SIGTERM', () => {
     console.log('SIGTERM signal received.');
     server.close(() => {
       console.log('Server closed.');
       mongoose.connection.close().then(() => {
         console.log('MongoDB connection closed.');
         process.exit(0);
       });
     });
   });
   
   // Handle uncaught exceptions
   process.on('uncaughtException', (err) => {
     console.error('Uncaught Exception:', err);
     // Keep the process running but log the error
   });
   
   // Handle unhandled promise rejections
   process.on('unhandledRejection', (reason, promise) => {
     console.error('Unhandled Rejection at:', promise, 'reason:', reason);
     // Keep the process running but log the error
   });
   
   export default app;