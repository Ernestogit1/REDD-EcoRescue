const mongoose = require('mongoose');

const levelCompletionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  levelId: {
    type: String, // or Number, depending on your level identifier
    required: true,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
});

levelCompletionSchema.index({ userId: 1, levelId: 1 }, { unique: true });

module.exports = mongoose.model('LevelCompletion', levelCompletionSchema); 