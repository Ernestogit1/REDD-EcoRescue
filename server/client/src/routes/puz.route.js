const express = require("express");
const {
    saveGameData,
    getUserGameData,
    getUserStats,
    getLeaderboard
} = require("../controllers/puz.controller");
const verifyToken = require('../middlewares/auth.middleware');

const router = express.Router();

router.post("/", verifyToken, saveGameData);
router.get("/user-games", verifyToken, getUserGameData);
router.get("/user-stats", verifyToken, getUserStats);
router.get("/stats/leaderboard", verifyToken, getLeaderboard); // ADD THIS

module.exports = router;