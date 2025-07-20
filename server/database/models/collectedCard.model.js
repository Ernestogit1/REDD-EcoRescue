const mongoose = require('mongoose');

const collectedCardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  levelId: {
    type: String, // or Number, depending on your level identifier
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  collectedAt: {
    type: Date,
    default: Date.now,
  },
});

collectedCardSchema.index({ userId: 1, levelId: 1 }, { unique: true });

module.exports = mongoose.model('CollectedCard', collectedCardSchema); 