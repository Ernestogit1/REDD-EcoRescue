const express = require('express');
const { uploadImage, getUserImages } = require('../controllers/color.controller.js');
const verifyToken = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/upload', verifyToken, uploadImage);
router.get('/user/images', verifyToken, getUserImages);

module.exports = router;