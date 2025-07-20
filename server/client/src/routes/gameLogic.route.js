const express = require('express');
const router = express.Router();
const levelingUpController = require('../controllers/gameLogic.controller');

// Get user's leveling progress
router.get('/progress/:userId', levelingUpController.getUserProgress);

// Initialize user leveling
router.post('/initialize', levelingUpController.initializeUser);

// Add collected card to leveling system
router.post('/add-card', levelingUpController.addCollectedCard);

// Remove collected card from leveling system
router.delete('/remove-card', levelingUpController.removeCollectedCard);

// Get available collected cards for dropdown
router.get('/available-cards/:userId', levelingUpController.getAvailableCards);

// Get leaderboard
router.get('/leaderboard', levelingUpController.getLeaderboard);

module.exports = router;