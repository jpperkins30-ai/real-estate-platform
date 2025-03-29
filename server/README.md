# Real Estate Platform Server

This is the backend server for the Real Estate Platform. It provides APIs for managing properties, states, counties, and data collection.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd real-estate-platform/server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the server directory with the following variables:
```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/real-estate-platform
JWT_SECRET=your-secret-key
```

4. Start MongoDB:
```bash
mongod
```

## Development

To run the server in development mode with hot reloading:
```bash
npm run dev
```

## Production

To build and run the server in production mode:
```bash
npm run build
npm start
```

## API Endpoints

### Main Routes (/api/main)
- GET /properties - Get all properties
- GET /properties/:id - Get property by ID
- GET /states - Get all states
- GET /states/:id - Get state by ID
- GET /counties - Get all counties
- GET /counties/:id - Get county by ID
- GET /us-map - Get US map

### Types Routes (/api/types)
- GET /controllers - Get all controllers
- GET /controllers/:id - Get controller by ID
- POST /controllers - Create new controller
- PUT /controllers/:id - Update controller
- DELETE /controllers/:id - Delete controller

### Collector Types Routes (/api/collector-types)
- GET /data-sources - Get all data sources
- GET /data-sources/:id - Get data source by ID
- POST /data-sources - Create new data source
- PUT /data-sources/:id - Update data source
- DELETE /data-sources/:id - Delete data source
- GET /collections - Get all collections
- GET /collections/:id - Get collection by ID
- POST /collections - Create new collection
- PUT /collections/:id - Update collection
- DELETE /collections/:id - Delete collection

## Authentication

All API endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your-token>
```

## Error Handling

The API returns appropriate HTTP status codes and error messages in the following format:
```json
{
  "error": "Error message"
}
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 