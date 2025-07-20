
const LevelingUp = require('../../../database/models/levelingUp.model');
const CollectedCard = require('../../../database/models/collectedCard.model');
const User = require('../../../database/models/user.model');

class LevelingUpService {
  
  // Initialize or get user's leveling data
  async initializeUserLeveling(userId) {
    try {
      let userLeveling = await LevelingUp.findOne({ userId })
        .populate('collectedCards')
        .populate('userId', 'username email rank');

      if (!userLeveling) {
        // Create new leveling record for user
        const collectedCards = await CollectedCard.find({ userId });
        
        userLeveling = new LevelingUp({
          userId,
          collectedCards: collectedCards.map(card => card._id),
          xp: 0,
          level: 1
        });
        
        // Calculate initial XP and level
        const levelUpResult = userLeveling.checkLevelUp();
        await userLeveling.save();
        
        return {
          userLeveling,
          levelUpResult
        };
      }

      return { userLeveling, levelUpResult: null };
    } catch (error) {
      throw new Error(`Error initializing user leveling: ${error.message}`);
    }
  }

  // Add a collected card and update XP/Level
  async addCollectedCard(userId, collectedCardId) {
    try {
      let userLeveling = await LevelingUp.findOne({ userId });
      
      if (!userLeveling) {
        const initResult = await this.initializeUserLeveling(userId);
        userLeveling = initResult.userLeveling;
      }

      // Check if card is already added
      if (!userLeveling.collectedCards.includes(collectedCardId)) {
        userLeveling.collectedCards.push(collectedCardId);
        
        // Recalculate XP and check for level up
        const levelUpResult = userLeveling.checkLevelUp();
        await userLeveling.save();
        
        // Populate the updated data
        await userLeveling.populate('collectedCards');
        await userLeveling.populate('userId', 'username email rank');
        
        return {
          userLeveling,
          levelUpResult,
          xpGained: LevelingUp.XP_PER_CARD
        };
      }

      return {
        userLeveling,
        levelUpResult: { leveledUp: false },
        xpGained: 0,
        message: 'Card already collected'
      };
    } catch (error) {
      throw new Error(`Error adding collected card: ${error.message}`);
    }
  }

  // Get user's leveling progress
  async getUserLevelingProgress(userId) {
    try {
      const userLeveling = await LevelingUp.findOne({ userId })
        .populate({
          path: 'collectedCards',
          select: 'name image levelId description collectedAt'
        })
        .populate('userId', 'username email rank avatar');

      if (!userLeveling) {
        // Initialize if doesn't exist
        const initResult = await this.initializeUserLeveling(userId);
        return initResult.userLeveling;
      }

      // Ensure XP is up to date
      const levelUpResult = userLeveling.checkLevelUp();
      if (levelUpResult.leveledUp) {
        await userLeveling.save();
      }

      const xpRequiredForNextLevel = LevelingUp.XP_REQUIRED_PER_LEVEL;
      const xpProgress = (userLeveling.xp / xpRequiredForNextLevel) * 100;

      return {
        ...userLeveling.toObject(),
        xpRequiredForNextLevel,
        xpProgress: Math.round(xpProgress * 100) / 100,
        cardsCollected: userLeveling.collectedCards.length,
        xpFromCards: userLeveling.collectedCards.length * LevelingUp.XP_PER_CARD
      };
    } catch (error) {
      throw new Error(`Error getting user leveling progress: ${error.message}`);
    }
  }

  // Get all available collected cards for dropdown
  async getAvailableCollectedCards(userId) {
    try {
      const allCollectedCards = await CollectedCard.find({ userId })
        .select('_id name image levelId description collectedAt')
        .sort({ collectedAt: -1 });

      const userLeveling = await LevelingUp.findOne({ userId });
      const assignedCardIds = userLeveling ? userLeveling.collectedCards.map(id => id.toString()) : [];

      return {
        allCards: allCollectedCards,
        assignedCards: assignedCardIds,
        availableCards: allCollectedCards.filter(card => 
          !assignedCardIds.includes(card._id.toString())
        )
      };
    } catch (error) {
      throw new Error(`Error getting available collected cards: ${error.message}`);
    }
  }

  // Remove a collected card from leveling (decrease XP)
  async removeCollectedCard(userId, collectedCardId) {
    try {
      const userLeveling = await LevelingUp.findOne({ userId });
      
      if (!userLeveling) {
        throw new Error('User leveling data not found');
      }

      const cardIndex = userLeveling.collectedCards.indexOf(collectedCardId);
      if (cardIndex > -1) {
        userLeveling.collectedCards.splice(cardIndex, 1);
        
        // Recalculate XP and level
        const levelUpResult = userLeveling.checkLevelUp();
        await userLeveling.save();
        
        await userLeveling.populate('collectedCards');
        await userLeveling.populate('userId', 'username email rank');
        
        return {
          userLeveling,
          levelUpResult,
          xpLost: LevelingUp.XP_PER_CARD
        };
      }

      return {
        userLeveling,
        xpLost: 0,
        message: 'Card not found in collection'
      };
    } catch (error) {
      throw new Error(`Error removing collected card: ${error.message}`);
    }
  }

  // Get leaderboard based on levels
  async getLeaderboard(limit = 10) {
    try {
      const leaderboard = await LevelingUp.find()
        .populate('userId', 'username email rank avatar')
        .sort({ level: -1, totalXpEarned: -1 })
        .limit(limit);

      return leaderboard.map((entry, index) => ({
        rank: index + 1,
        user: entry.userId,
        level: entry.level,
        xp: entry.xp,
        totalXpEarned: entry.totalXpEarned,
        cardsCollected: entry.collectedCards.length,
        lastLevelUp: entry.lastLevelUp
      }));
    } catch (error) {
      throw new Error(`Error getting leaderboard: ${error.message}`);
    }
  }
}

module.exports = new LevelingUpService();