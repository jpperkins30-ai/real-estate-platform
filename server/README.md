# Real Estate Platform - Server

This is the backend server for the Real Estate Platform application, built with Express, TypeScript, and MongoDB.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create `.env` file:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/real-estate
   JWT_SECRET=your_strong_jwt_secret_key_change_in_production
   NODE_ENV=development
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Build for production:
   ```
   npm run build
   ```

5. Start production server:
   ```
   npm start
   ```

## Project Structure

- `src/`: Source code
  - `index.ts`: Application entry point
  - `routes/`: API route definitions
  - `models/`: Mongoose models
  - `middleware/`: Custom middleware
  - `utils/`: Utility functions
- `dist/`: Compiled JavaScript (created when building)

## TypeScript Notes

This project uses TypeScript to ensure type safety. We've added `@ts-ignore` comments in a few places to bypass specific TypeScript errors related to Express route handlers returning Response objects instead of void.

## API Endpoints

### Authentication
- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: User login

### Properties
- `GET /api/properties`: Get all properties
- `GET /api/properties/:id`: Get a specific property
- `POST /api/properties`: Create a new property
- `PUT /api/properties/:id`: Update a property
- `DELETE /api/properties/:id`: Delete a property
- `GET /api/properties/stats/county`: Get property statistics by county 