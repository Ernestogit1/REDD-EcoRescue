const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authClient = require('../client/src/routes/auth.route');
const mobileRoutes = require('../mobile/src/routes');
const cardRoutes = require("../client/src/routes/card.route");
const puzRoutes = require("../client/src/routes/puz.route");
const matchRoutes = require("../client/src/routes/match.route");
const colorRoutes = require("../client/src/routes/color.route");
const collectedCardRoutes = require("../client/src/routes/collectedCard.route");
const levelCompletionRoutes = require("../client/src/routes/levelCompletion.route");
const authAdmin = require('../admin/src/routes/auth.route');
const shopRoutes = require('../mobile/src/routes/shop.route');
const inventoryRoutes = require('../mobile/src/routes/inventory.route');
const chartAdmin = require ('../admin/src/routes/chart.route')

const levelingUpRoutes = require("../client/src/routes/gameLogic.route");


const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:5000', // Backend API
      'http://localhost:5173', // Web API
      'http://localhost:5178', // Admin API

      //games
      'http://localhost:5177', // Card API
      'http://localhost:5176', // Puzzle API
      'http://localhost:5175', // Match API
      'http://localhost:5174', // Color API

      // mobile
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
app.use('/api/admin/auth', authAdmin);
app.use('/api/admin/charts', chartAdmin);

// game route
app.use('/api/mobile', mobileRoutes);
app.use('/api/card', cardRoutes);
app.use('/api/puz', puzRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/color', colorRoutes);
app.use('/api/collected-cards', collectedCardRoutes);
app.use('/api/levels', levelCompletionRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/leveling', levelingUpRoutes);


module.exports = app;