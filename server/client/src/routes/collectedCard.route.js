const express = require('express');
const { collectCard } = require('../controllers/collectedCard.controller');
const verifyToken = require('../middlewares/auth.middleware');

const router = express.Router();

// POST /api/collected-cards/collect
router.post('/collect', verifyToken, collectCard);

module.exports = router; 