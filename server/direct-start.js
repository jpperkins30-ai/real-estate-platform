/**
 * Direct server starter with pre-configured environment
 */
// Set JWT_SECRET before anything else
process.env.JWT_SECRET = 'direct-fix-jwt-secret';
process.env.PORT = '4000';
process.env.NODE_ENV = 'development';
process.env.MONGODB_URI = 'mongodb://localhost:27017/real-estate-platform';

console.log('Environment variables set directly:');
console.log('- JWT_SECRET: [SET]');
console.log('- PORT:', process.env.PORT);
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- MONGODB_URI:', process.env.MONGODB_URI);

// Now require the index
console.log('\nStarting server...');
try {
  require('./src/index.ts');
} catch (err) {
  console.error('Failed to start server:', err);
}
