const express = require('express');
const {
    createMatch,
    getUserGames,
    getUserStats
} = require('../controllers/match.controller');
const verifyToken = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', verifyToken, createMatch);
router.get('/user-games', verifyToken, getUserGames);
router.get('/user-stats', verifyToken, getUserStats);

module.exports = router;