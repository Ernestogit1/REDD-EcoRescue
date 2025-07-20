const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  food: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  quantity: { type: Number, default: 1 },
}, { timestamps: true });

// Ensure a user can only have one entry per food
inventorySchema.index({ user: 1, food: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', inventorySchema);
