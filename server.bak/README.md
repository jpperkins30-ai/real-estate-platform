# Real Estate Investment Platform API

## Project Overview
A RESTful API for managing real estate properties, built with Express.js, TypeScript, MongoDB, and Swagger documentation.

## Tech Stack
- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- Swagger/OpenAPI documentation
- PM2 for process management

## Getting Started

### Prerequisites
- Node.js installed
- MongoDB installed and running
- PM2 installed globally (`npm install -g pm2`)

### Installation
1. Install dependencies:
```bash
npm install
```

2. Environment variables (`.env`):
```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/local
JWT_SECRET=X9f$mK2#pQ7zL4^rN6*jH3@bT5&wS8!uE
```

### Running the Server
Start the server using PM2:
```bash
pm2 start ecosystem.config.js
```

PM2 Commands:
```bash
# Check server status
pm2 status

# View logs
pm2 logs

# Restart server
pm2 restart all

# Stop server
pm2 stop all

# Delete all processes
pm2 delete all
```

## API Documentation
- Swagger UI: http://localhost:4000/api-docs
- Health Check: http://localhost:4000/health
- API Root: http://localhost:4000

## API Endpoints

### Properties
- GET `/api/properties` - Get all properties
- GET `/api/properties/:id` - Get property by ID
- POST `/api/properties` - Create new property

## Project Structure
```
server/
├── src/
│   ├── index.ts          # Main application file
│   ├── swagger.ts        # Swagger configuration
│   ├── models/
│   │   └── Property.ts   # Property model
│   └── routes/
│       └── properties.ts # Property routes
├── ecosystem.config.js    # PM2 configuration
└── .env                  # Environment variables
```

## Development Notes

### MongoDB Connection
The application connects to MongoDB using the following options:
```typescript
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 50,
  connectTimeoutMS: 10000
};
```

### Property Model Fields
- address (required)
- city
- state (required)
- county (required)
- zipCode
- propertyType
- price
- saleType (enum: ['Tax Lien', 'Deed', 'Conventional'])

### PM2 Configuration
The server runs under PM2 with the following settings:
- No file watching (prevents unnecessary restarts)
- Single instance
- Auto-restart enabled
- 4-second restart delay
- Maximum 10 restarts

## Troubleshooting
1. If the server won't start:
   - Check if MongoDB is running
   - Verify port 4000 is available
   - Check PM2 logs for errors

2. If Swagger UI is inaccessible:
   - Verify server is running (`pm2 status`)
   - Check browser console for CORS issues
   - Try both localhost and 127.0.0.1

## Next Steps
Planned features:
- User authentication
- Property search and filtering
- Image upload support
- Advanced property details
- User roles and permissions 