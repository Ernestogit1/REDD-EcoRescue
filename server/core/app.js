const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authClient = require('../client/src/routes/auth.route');
const mobileRoutes = require('../mobile/src/routes');
const cardRoutes = require("../client/src/routes/card.route.js");



const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:5000',
      'http://localhost:5173',
      'http://localhost:5177', // Card Game
      'http://localhost:19006', // Expo web
      'http://localhost:19000', // Expo client
      'http://localhost:8081',  // React Native dev server
      'exp://*',               // Expo Go app
      '*'                      // Allow all origins (for development only)
    ],
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Expires', 'Pragma'],
    credentials: true,
  })
);

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser());

// Routes
app.use('/api/auth',  authClient);
app.use('/api/mobile', mobileRoutes);
app.use('/api/card', cardRoutes);


module.exports = app;