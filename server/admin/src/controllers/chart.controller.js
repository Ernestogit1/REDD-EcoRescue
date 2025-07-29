const User = require('../../../database/models/user.model');
const Card = require('../../../database/models/card.model');
const Puz = require('../../../database/models/puz.model');
const Match = require('../../../database/models/match.model');
const Color = require('../../../database/models/color.model');
const LevelCompletion = require('../../../database/models/levelCompletion.model'); // ADD THIS

// Get user statistics
exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ isAdmin: true });
    const regularUsers = totalUsers - adminUsers;
    
    // User registration over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const userRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // User rank distribution
    const rankDistribution = await User.aggregate([
      {
        $group: {
          _id: "$rank",
          count: { $sum: 1 }
        }
      }
    ]);

    // Top users by points
    const topUsers = await User.find({})
      .sort({ points: -1 })
      .limit(10)
      .select('username points rank');

    // ADD LEVEL-BASED LEADERBOARDS
    // Get all unique level IDs
    const levelIds = await LevelCompletion.distinct('levelId');
    
    // Create leaderboards for each level
    const levelLeaderboards = {};
    
    for (const levelId of levelIds) {
      const leaderboard = await LevelCompletion.aggregate([
        { $match: { levelId: levelId } },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $group: {
            _id: '$userId',
            username: { $first: '$user.username' },
            rank: { $first: '$user.rank' },
            avatar: { $first: '$user.avatar' },
            totalPoints: { $sum: '$points' },
            completionsCount: { $sum: 1 },
            lastCompleted: { $max: '$completedAt' },
            firstCompleted: { $min: '$completedAt' }
          }
        },
        { $sort: { totalPoints: -1, completionsCount: -1, firstCompleted: 1 } },
        { $limit: 10 }
      ]);
      
      levelLeaderboards[levelId] = leaderboard;
    }

    // Get top performers across all levels
    const topLevelPlayers = await LevelCompletion.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$userId',
          username: { $first: '$user.username' },
          rank: { $first: '$user.rank' },
          avatar: { $first: '$user.avatar' },
          totalPoints: { $sum: '$points' },
          levelsCompleted: { $addToSet: '$levelId' },
          totalCompletions: { $sum: 1 },
          lastActivity: { $max: '$completedAt' }
        }
      },
      {
        $addFields: {
          uniqueLevelsCount: { $size: '$levelsCompleted' }
        }
      },
      { $sort: { totalPoints: -1, uniqueLevelsCount: -1, totalCompletions: -1 } },
      { $limit: 10 }
    ]);

    // Level completion statistics
    const levelStats = await LevelCompletion.aggregate([
      {
        $group: {
          _id: '$levelId',
          totalCompletions: { $sum: 1 },
          uniquePlayers: { $addToSet: '$userId' },
          averagePoints: { $avg: '$points' },
          totalPoints: { $sum: '$points' },
          firstCompletion: { $min: '$completedAt' },
          lastCompletion: { $max: '$completedAt' }
        }
      },
      {
        $addFields: {
          uniquePlayersCount: { $size: '$uniquePlayers' }
        }
      },
      { $sort: { totalCompletions: -1 } }
    ]);

    // ADD GAME-SPECIFIC LEADERBOARDS (if not already present)
    // Top Card Game Players
    const topCardPlayers = await Card.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$userId',
          username: { $first: '$user.username' },
          rank: { $first: '$user.rank' },
          totalPoints: { $first: '$user.points' },
          completedGames: { $sum: '$completed' },
          totalGames: { $sum: 1 },
          averageTime: { $avg: '$timeTaken' },
          bestTime: { $min: '$timeTaken' },
          totalFailed: { $sum: '$failed' }
        }
      },
      { $sort: { totalPoints: -1, completedGames: -1 } },
      { $limit: 10 }
    ]);

    // Top Puzzle Game Players
    const topPuzzlePlayers = await Puz.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$userId',
          username: { $first: '$user.username' },
          rank: { $first: '$user.rank' },
          totalPoints: { $first: '$user.points' },
          completedGames: { $sum: { $cond: ['$isCompleted', 1, 0] } },
          totalGames: { $sum: 1 },
          averageTime: { $avg: '$timeSpent' },
          bestTime: { $min: '$timeSpent' }
        }
      },
      { $sort: { totalPoints: -1, completedGames: -1 } },
      { $limit: 10 }
    ]);

    // Top Match Game Players
    const topMatchPlayers = await Match.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$userId',
          username: { $first: '$user.username' },
          rank: { $first: '$user.rank' },
          totalPoints: { $first: '$user.points' },
          totalGames: { $sum: 1 },
          averageScore: { $avg: '$score' },
          highestScore: { $max: '$score' },
          averageTime: { $avg: '$timeSpent' },
          bestTime: { $min: '$timeSpent' }
        }
      },
      { $sort: { totalPoints: -1, highestScore: -1 } },
      { $limit: 10 }
    ]);

    // Top Color Game Players
    const topColorPlayers = await Color.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$userId',
          username: { $first: '$user.username' },
          rank: { $first: '$user.rank' },
          totalPoints: { $first: '$user.points' },
          imagesCreated: { $sum: 1 },
          latestImage: { $last: '$createdAt' }
        }
      },
      { $sort: { totalPoints: -1, imagesCreated: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      totalUsers,
      adminUsers,
      regularUsers,
      userRegistrations,
      rankDistribution,
      topUsers,
      // ADD THESE NEW LEVEL-BASED FIELDS
      levelLeaderboards,
      topLevelPlayers,
      levelStats,
      availableLevels: levelIds.sort(),
      // ADD THESE NEW FIELDS
      topCardPlayers,
      topPuzzlePlayers,
      topMatchPlayers,
      topColorPlayers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD NEW ENDPOINT: Get specific level leaderboard
exports.getLevelLeaderboard = async (req, res) => {
  try {
    const { levelId } = req.params;
    
    if (!levelId) {
      return res.status(400).json({ message: 'Level ID is required' });
    }

    const leaderboard = await LevelCompletion.aggregate([
      { $match: { levelId: levelId } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$userId',
          username: { $first: '$user.username' },
          rank: { $first: '$user.rank' },
          avatar: { $first: '$user.avatar' },
          totalPoints: { $sum: '$points' },
          completionsCount: { $sum: 1 },
          lastCompleted: { $max: '$completedAt' },
          firstCompleted: { $min: '$completedAt' },
          averagePoints: { $avg: '$points' }
        }
      },
      { $sort: { totalPoints: -1, completionsCount: -1, firstCompleted: 1 } },
      { $limit: 50 } // Get top 50 for this specific level
    ]);

    // Add ranking positions
    const rankedLeaderboard = leaderboard.map((player, index) => ({
      ...player,
      position: index + 1
    }));

    // Get level statistics
    const levelStat = await LevelCompletion.aggregate([
      { $match: { levelId: levelId } },
      {
        $group: {
          _id: levelId,
          totalCompletions: { $sum: 1 },
          uniquePlayers: { $addToSet: '$userId' },
          averagePoints: { $avg: '$points' },
          totalPoints: { $sum: '$points' },
          highestPoints: { $max: '$points' },
          lowestPoints: { $min: '$points' }
        }
      },
      {
        $addFields: {
          uniquePlayersCount: { $size: '$uniquePlayers' }
        }
      }
    ]);

    res.json({
      levelId,
      leaderboard: rankedLeaderboard,
      statistics: levelStat[0] || null,
      totalEntries: rankedLeaderboard.length
    });
  } catch (error) {
    console.error('Error fetching level leaderboard:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get game statistics
exports.getGameStats = async (req, res) => {
  try {
    // Memory Card Game Stats
    const cardStats = await Card.aggregate([
      {
        $group: {
          _id: "$difficulty",
          totalGames: { $sum: 1 },
          avgTimeTaken: { $avg: "$timeTaken" },
          avgCompleted: { $avg: "$completed" },
          avgFailed: { $avg: "$failed" }
        }
      }
    ]);

    const cardPlayedOverTime = await Card.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$gameDate"
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Jigsaw Puzzle Stats
    const puzStats = await Puz.aggregate([
      {
        $group: {
          _id: "$difficulty",
          totalGames: { $sum: 1 },
          avgTimeSpent: { $avg: "$timeSpent" },
          completionRate: {
            $avg: { $cond: ["$isCompleted", 1, 0] }
          }
        }
      }
    ]);

    const puzPlayedOverTime = await Puz.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$playedAt"
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Matching Game Stats
    const matchStats = await Match.aggregate([
      {
        $group: {
          _id: "$difficulty",
          totalGames: { $sum: 1 },
          avgScore: { $avg: "$score" },
          avgTimeSpent: { $avg: "$timeSpent" }
        }
      }
    ]);

    const matchPlayedOverTime = await Match.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$playedAt"
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Color Game Stats
    const colorStats = await Color.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const totalColorImages = await Color.countDocuments();

    // Game popularity
    const cardTotal = await Card.countDocuments();
    const puzTotal = await Puz.countDocuments();
    const matchTotal = await Match.countDocuments();
    const colorTotal = await Color.countDocuments();

    res.json({
      cardStats,
      cardPlayedOverTime,
      puzStats,
      puzPlayedOverTime,
      matchStats,
      matchPlayedOverTime,
      colorStats,
      totalColorImages,
      gamePopularity: {
        memoryCard: cardTotal,
        jigsawPuzzle: puzTotal,
        matching: matchTotal,
        coloring: colorTotal
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get overall analytics
exports.getOverallAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalGames = await Card.countDocuments() + 
                      await Puz.countDocuments() + 
                      await Match.countDocuments() + 
                      await Color.countDocuments();

    // Most active users based on points (instead of total games)
    const activeUsers = await User.find({})
      .sort({ points: -1 }) // Sort by points in descending order
      .limit(10)
      .select('username points rank avatar')
      .lean(); // Use lean() for better performance

    // Add totalPoints as an alias for consistency with frontend
    const activeUsersFormatted = activeUsers.map(user => ({
      ...user,
      totalPoints: user.points // Add this for chart compatibility
    }));

    res.json({
      totalUsers,
      totalGames,
      activeUsers: activeUsersFormatted
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};