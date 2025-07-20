const express = require('express');
const { completeLevel } = require('../controllers/levelCompletion.controller');
const verifyToken = require('../middlewares/auth.middleware');

const router = express.Router();

// POST /api/levels/complete
router.post('/complete', verifyToken, completeLevel);

module.exports = router; 