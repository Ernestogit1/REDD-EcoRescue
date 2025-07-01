const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cors());

// Import routes
const mobileRoutes = require('../mobile/src/routes');

// Route middleware
app.use('/api/mobile', mobileRoutes);

// Default route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'REDD-EcoRescue Server is running!',
    endpoints: {
      mobile: '/api/mobile',
      health: '/api/mobile/health'
    }
  });
});

module.exports = app;