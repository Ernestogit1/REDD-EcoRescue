const express = require('express');
const { completeLevel, getCompletedLevels } = require('../controllers/levelCompletion.controller');
const verifyToken = require('../middlewares/auth.middleware');

const router = express.Router();

// POST /api/levels/complete
router.post('/complete', verifyToken, completeLevel);
// GET /api/levels/completed
router.get('/completed', verifyToken, getCompletedLevels);

module.exports = router; 