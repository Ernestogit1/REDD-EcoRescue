const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Add or update inventory (when buying food)
router.post('/', authenticateToken, inventoryController.addOrUpdateInventory);

// Get user's inventory
router.get('/', authenticateToken, inventoryController.getUserInventory);

module.exports = router;
