const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Mock user data for development
const mockUsers = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    password: 'admin123' // In a real app, this would be hashed
  },
  {
    id: '2',
    name: 'Regular User',
    email: 'user@example.com',
    role: 'user',
    password: 'user123'
  }
];

// Login route
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = mockUsers.find(u => u.email === email);

  // Check if user exists and password matches
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Generate token
  const token = jwt.sign(
    { 
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET || 'fallback-jwt-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  // Return token
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// Registration route
router.post('/register', (req, res) => {
  // This is a simplified mock registration
  res.json({ message: 'Registration endpoint - mock implementation' });
});

// Verify token middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-jwt-secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Protected route example
router.get('/profile', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router; 