// src/config/env.ts
export const DB_CONFIG = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform'
};

export const SERVER_CONFIG = {
  port: process.env.PORT || 4000,
  environment: process.env.NODE_ENV || 'development'
};

export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'your_development_secret_key',
  expiresIn: '1d' // Token expires in 1 day
};