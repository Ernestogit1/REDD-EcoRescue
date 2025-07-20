const levelingUpService = require('../services/levelingUp.service');

const levelingUpController = {
  
  // Get user's leveling progress
  getUserProgress: async (req, res) => {
    try {
      const { userId } = req.params;
      
      const progress = await levelingUpService.getUserLevelingProgress(userId);
      
      res.status(200).json({
        success: true,
        data: progress
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Initialize user leveling
  initializeUser: async (req, res) => {
    try {
      const { userId } = req.body;
      
      const result = await levelingUpService.initializeUserLeveling(userId);
      
      res.status(200).json({
        success: true,
        message: 'User leveling initialized successfully',
        data: result.userLeveling,
        levelUp: result.levelUpResult
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Add collected card to leveling
  addCollectedCard: async (req, res) => {
    try {
      const { userId, collectedCardId } = req.body;
      
      const result = await levelingUpService.addCollectedCard(userId, collectedCardId);
      
      res.status(200).json({
        success: true,
        message: result.message || 'Card added successfully',
        data: result.userLeveling,
        levelUp: result.levelUpResult,
        xpGained: result.xpGained
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Remove collected card from leveling
  removeCollectedCard: async (req, res) => {
    try {
      const { userId, collectedCardId } = req.body;
      
      const result = await levelingUpService.removeCollectedCard(userId, collectedCardId);
      
      res.status(200).json({
        success: true,
        message: result.message || 'Card removed successfully',
        data: result.userLeveling,
        xpLost: result.xpLost
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get available collected cards for dropdown
  getAvailableCards: async (req, res) => {
    try {
      const { userId } = req.params;
      
      const cards = await levelingUpService.getAvailableCollectedCards(userId);
      
      res.status(200).json({
        success: true,
        data: cards
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get leaderboard
  getLeaderboard: async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      
      const leaderboard = await levelingUpService.getLeaderboard(parseInt(limit));
      
      res.status(200).json({
        success: true,
        data: leaderboard
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = levelingUpController;