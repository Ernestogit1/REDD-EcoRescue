const express = require('express');
const authRoutes = require('./auth.route');
const pointsRoutes = require('./points.route');

const router = express.Router();

// Mount auth routes
router.use('/auth', authRoutes);
// Mount points routes
router.use('/points', pointsRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'REDD-EcoRescue Mobile API is running!',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
