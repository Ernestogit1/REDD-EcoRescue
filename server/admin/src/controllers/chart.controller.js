const User = require('../../../database/models/user.model');
const Card = require('../../../database/models/card.model');
const Puz = require('../../../database/models/puz.model');
const Match = require('../../../database/models/match.model');
const Color = require('../../../database/models/color.model');

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

    res.json({
      totalUsers,
      adminUsers,
      regularUsers,
      userRegistrations,
      rankDistribution,
      topUsers
    });
  } catch (error) {
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

    // Most active users
    const activeUsers = await User.aggregate([
      {
        $lookup: {
          from: 'cards',
          localField: '_id',
          foreignField: 'userId',
          as: 'cardGames'
        }
      },
      {
        $lookup: {
          from: 'puzs',
          localField: '_id',
          foreignField: 'userId',
          as: 'puzGames'
        }
      },
      {
        $lookup: {
          from: 'matches',
          localField: '_id',
          foreignField: 'userId',
          as: 'matchGames'
        }
      },
      {
        $lookup: {
          from: 'colors',
          localField: '_id',
          foreignField: 'userId',
          as: 'colorGames'
        }
      },
      {
        $addFields: {
          totalGames: {
            $add: [
              { $size: '$cardGames' },
              { $size: '$puzGames' },
              { $size: '$matchGames' },
              { $size: '$colorGames' }
            ]
          }
        }
      },
      {
        $sort: { totalGames: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          username: 1,
          points: 1,
          rank: 1,
          totalGames: 1
        }
      }
    ]);

    res.json({
      totalUsers,
      totalGames,
      activeUsers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};