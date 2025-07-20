const mongoose = require('mongoose');

const levelingUpSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // Each user has only one leveling record
  },
  collectedCards: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CollectedCard'
  }],
  xp: {
    type: Number,
    default: 0,
    min: 0
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  totalXpEarned: {
    type: Number,
    default: 0 // Track total XP earned throughout the game
  },
  lastLevelUp: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Constants for XP system
levelingUpSchema.statics.XP_PER_CARD = 100;
levelingUpSchema.statics.XP_REQUIRED_PER_LEVEL = 500;

// Method to calculate XP based on collected cards
levelingUpSchema.methods.calculateXP = function() {
  return this.collectedCards.length * this.constructor.XP_PER_CARD;
};

// Method to check if player should level up
levelingUpSchema.methods.checkLevelUp = function() {
  const currentXP = this.calculateXP();
  const xpRequiredPerLevel = this.constructor.XP_REQUIRED_PER_LEVEL;
  
  if (currentXP >= xpRequiredPerLevel) {
    const newLevel = Math.floor(currentXP / xpRequiredPerLevel) + 1;
    const remainingXP = currentXP % xpRequiredPerLevel;
    
    const leveledUp = newLevel > this.level;
    
    if (leveledUp) {
      this.level = newLevel;
      this.lastLevelUp = new Date();
    }
    
    this.xp = remainingXP;
    this.totalXpEarned = currentXP;
    
    return { leveledUp, newLevel: this.level, remainingXP };
  }
  
  this.xp = currentXP;
  this.totalXpEarned = currentXP;
  return { leveledUp: false, newLevel: this.level, remainingXP: currentXP };
};

module.exports = mongoose.model('LevelingUp', levelingUpSchema);