const Inventory = require('../../../database/models/inventory.model');
const Shop = require('../../../database/models/shop.model');

// Add or update inventory when a food is bought
exports.addOrUpdateInventory = async (req, res) => {
  try {
    const userId = req.userDetails._id;
    const { foodId, quantity = 1 } = req.body;
    if (!foodId) return res.status(400).json({ message: 'Food ID is required' });

    // Check if the food exists
    const food = await Shop.findById(foodId);
    if (!food) return res.status(404).json({ message: 'Food not found' });

    // Try to find existing inventory
    let inventory = await Inventory.findOne({ user: userId, food: foodId });
    if (inventory) {
      inventory.quantity += quantity;
      await inventory.save();
    } else {
      inventory = await Inventory.create({ user: userId, food: foodId, quantity });
    }
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all inventory for a user
exports.getUserInventory = async (req, res) => {
  try {
    const userId = req.userDetails._id;
    const inventory = await Inventory.find({ user: userId }).populate('food');
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Consume food from inventory
exports.consumeFood = async (req, res) => {
  try {
    const userId = req.userDetails._id;
    const { foodId } = req.body;
    if (!foodId) return res.status(400).json({ message: 'Food ID is required' });

    let inventory = await Inventory.findOne({ user: userId, food: foodId });
    if (!inventory || inventory.quantity < 1) {
      return res.status(400).json({ message: 'No food left in inventory' });
    }
    inventory.quantity -= 1;
    if (inventory.quantity === 0) {
      await Inventory.deleteOne({ _id: inventory._id });
      return res.json({ message: 'Food consumed and removed from inventory', foodId });
    } else {
      await inventory.save();
      return res.json({ message: 'Food consumed', foodId, quantity: inventory.quantity });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
