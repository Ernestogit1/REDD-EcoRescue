const express = require("express");
const {
    saveGameData,
    getUserGameData,
    getUserStats
} = require("../controllers/puz.controller");
const verifyToken = require('../middlewares/auth.middleware');

const router = express.Router();

router.post("/", verifyToken, saveGameData);
router.get("/user-games", verifyToken, getUserGameData);
router.get("/user-stats", verifyToken, getUserStats);

module.exports = router;