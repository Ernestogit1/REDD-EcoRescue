const express = require('express');
const { registerUser, loginUser,logoutUser, getUserProfile, googleAuth } = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', registerUser);

router.post('/login', loginUser);
router.post('/google', googleAuth);

router.post('/logout', authMiddleware, logoutUser);


router.get('/profile', authMiddleware, getUserProfile);
// router.put('/profile', authMiddleware, updateUserProfile);

module.exports = router;