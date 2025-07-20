const Shop = require('../../../database/models/shop.model');
const User = require('../../../database/models/user.model');
const Inventory = require('../../../database/models/inventory.model');

// Create a single shop item (expects JSON, not file upload)
exports.createShopItem = async (req, res) => {
  try {
    const { name, animal, description, price, image } = req.body;
    if (!name || !animal || !price || !image) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    const shopItem = new Shop({
      name,
      animal,
      description,
      price,
      image
    });
    await shopItem.save();
    res.status(201).json(shopItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Bulk insert shop items (expects array of JSON objects)
exports.bulkInsertShopItems = async (req, res) => {
  try {
    const items = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'Input should be an array of shop items.' });
    }
    const inserted = await Shop.insertMany(items);
    res.status(201).json(inserted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllShopItems = async (req, res) => {
  const items = await Shop.find();
  res.json(items);
};

exports.getShopItem = async (req, res) => {
  const item = await Shop.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json(item);
};

exports.updateShopItem = async (req, res) => {
  try {
    const { name, animal, description, price, image } = req.body;
    let update = { name, animal, description, price, image };
    const item = await Shop.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteShopItem = async (req, res) => {
  const item = await Shop.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Deleted' });
};

// Buy a shop item and deduct points from user
exports.buyShopItem = async (req, res) => {
  try {
    // Get the item ID from request body
    const { itemId } = req.body;
    if (!itemId) {
      return res.status(400).json({ message: 'Item ID is required' });
    }

    // Get the user from the request (added by auth middleware)
    const user = req.userDetails;
    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Find the shop item
    const shopItem = await Shop.findById(itemId);
    if (!shopItem) {
      return res.status(404).json({ message: 'Shop item not found' });
    }

    // Check if user has enough points
    if (user.points < shopItem.price) {
      return res.status(400).json({ 
        message: 'Not enough points', 
        required: shopItem.price, 
        available: user.points 
      });
    }

    // Deduct points from user
    user.points -= shopItem.price;
    await user.save();

    // Add or update inventory
    let inventory = await Inventory.findOne({ user: user._id, food: itemId });
    if (inventory) {
      inventory.quantity += 1;
      await inventory.save();
    } else {
      inventory = await Inventory.create({ user: user._id, food: itemId, quantity: 1 });
    }

    // Return success response with updated user points and inventory
    res.json({
      success: true,
      message: `Successfully purchased ${shopItem.name}`,
      item: shopItem,
      pointsDeducted: shopItem.price,
      remainingPoints: user.points,
      inventory: {
        food: itemId,
        quantity: inventory.quantity
      }
    });
  } catch (err) {
    console.error('Error buying shop item:', err);
    res.status(500).json({ message: err.message });
  }
};