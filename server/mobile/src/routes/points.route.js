const express = require('express');
const router = express.Router();
const pointsController = require('../controllers/points.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// POST /add - add points to the authenticated user
router.post('/add', authenticateToken, pointsController.addPoints);

module.exports = router;
