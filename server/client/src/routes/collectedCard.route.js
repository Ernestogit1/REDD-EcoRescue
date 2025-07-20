const express = require('express');
const { collectCard, getUserCollectedCards } = require('../controllers/collectedCard.controller');
const verifyToken = require('../middlewares/auth.middleware');

const router = express.Router();

// POST /api/collected-cards/collect
router.post('/collect', verifyToken, collectCard);
// GET /api/collected-cards/user
router.get('/user', verifyToken, getUserCollectedCards);

module.exports = router; 