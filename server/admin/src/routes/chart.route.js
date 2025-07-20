const express = require('express');
const router = express.Router();
const chartController = require('../controllers/chart.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/user-stats', authMiddleware, chartController.getUserStats);
router.get('/game-stats', authMiddleware, chartController.getGameStats);
router.get('/overall-analytics', authMiddleware, chartController.getOverallAnalytics);

module.exports = router;