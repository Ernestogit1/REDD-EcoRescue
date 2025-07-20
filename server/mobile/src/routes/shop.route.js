const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Create (JSON)
router.post('/', shopController.createShopItem);

// Bulk insert (JSON array)
router.post('/bulk', shopController.bulkInsertShopItems);

// Read all
router.get('/', shopController.getAllShopItems);

// Read one
router.get('/:id', shopController.getShopItem);

// Update (JSON)
router.put('/:id', shopController.updateShopItem);

// Delete
router.delete('/:id', shopController.deleteShopItem);

// Buy an item (requires authentication)
router.post('/buy', authenticateToken, shopController.buyShopItem);

module.exports = router;