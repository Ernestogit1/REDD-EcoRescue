const express = require('express');
const { adminLogin, adminLogout, getAdminProfile } = require('../controllers/auth.controller');
const adminAuthMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// Public routes
router.post('/login', adminLogin);

// Protected routes
router.post('/logout', adminAuthMiddleware, adminLogout);
router.get('/profile', adminAuthMiddleware, getAdminProfile);

module.exports = router;