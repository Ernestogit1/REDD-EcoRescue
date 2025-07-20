const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  animal: { type: Array, required: true },
  description: { type: String },
  image: { type: String, required: true }, // Cloudinary URL
  price: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Shop', shopSchema);
