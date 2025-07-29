const express = require('express');
const {
    uploadImage,
    getUserImages,
    getLeaderboard
} = require('../controllers/color.controller');
const verifyToken = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/upload', verifyToken, uploadImage);
router.get('/user-images', verifyToken, getUserImages);
router.get('/stats/leaderboard', verifyToken, getLeaderboard);

module.exports = router;