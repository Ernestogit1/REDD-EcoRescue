const express = require('express');
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile 
} = require('../controllers/auth.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', authenticateToken, getUserProfile);
router.put('/profile', authenticateToken, updateUserProfile);

module.exports = router;
