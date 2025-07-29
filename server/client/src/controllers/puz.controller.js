const Puz = require('../../../database/models/puz.model');

// ✅ Save Game Data
const saveGameData = async (req, res) => {
    try {
        const userId = req.user._id;

        const { timeSpent, difficulty, isCompleted, playedAt } = req.body;

        if (!userId || timeSpent === undefined || difficulty === undefined || 
            isCompleted === undefined || playedAt === undefined) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const newPuzzle = new Puz({
            userId,
            timeSpent,
            difficulty,
            isCompleted,
            playedAt,
        });

        await newPuzzle.save();
        return res.status(201).json({ 
            success: true,
            message: "Puzzle game data saved successfully" 
        });

    } catch (error) {
        console.error("Error saving puzzle game data:", error);
        return res.status(500).json({ 
            success: false,
            message: "Error saving puzzle game data", 
            error: error.message 
        });
    }
};

const getUserGameData = async (req, res) => {
    try {
        const userId = req.user._id;
        const gameData = await Puz.find({ userId })
            .sort({ playedAt: -1 }) 
            .select("-__v"); 

        if (!gameData.length) {
            return res.status(200).json({ 
                message: "No puzzle game data found", 
                data: [] 
            });
        }

        return res.status(200).json(gameData);

    } catch (error) {
        console.error("Error fetching user puzzle game data:", error);
        return res.status(500).json({ 
            message: "Error fetching puzzle game data", 
            error: error.message 
        });
    }
};

const getUserStats = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const stats = await Puz.aggregate([
            { $match: { userId: userId } },
            { $group: {
                _id: "$difficulty",
                gamesPlayed: { $sum: 1 },
                averageTimeSpent: { $avg: "$timeSpent" },
                completedGames: { $sum: { $cond: [{ $eq: ["$isCompleted", true] }, 1, 0] } },
                bestTime: { $min: "$timeSpent" }
            }},
            { $sort: { _id: 1 } }
        ]);

        if (!stats.length) {
            return res.status(200).json({ 
                message: "No stats available", 
                data: [] 
            });
        }

        return res.status(200).json(stats);

    } catch (error) {
        console.error("Error fetching user puzzle stats:", error);
        return res.status(500).json({ 
            message: "Error fetching puzzle stats", 
            error: error.message 
        });
    }
};

// Add this function to puz.controller.js
const getLeaderboard = async (req, res) => {
    try {
        console.log('Fetching puzzle leaderboard...');
        
        const leaderboard = await Puz.aggregate([
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
                    completedGames: { $sum: { $cond: ['$isCompleted', 1, 0] } },
                    totalGames: { $sum: 1 },
                    averageTime: { $avg: '$timeSpent' },
                    bestTime: { $min: '$timeSpent' }
                }
            },
            { $sort: { completedGames: -1, averageTime: 1 } },
            { $limit: 50 }
        ]);

        console.log('Puzzle leaderboard data:', leaderboard);
        res.status(200).json(leaderboard);
    } catch (error) {
        console.error('Error fetching puzzle leaderboard:', error);
        res.status(500).json({ message: 'Error fetching leaderboard', error });
    }
};

// Update the module.exports
module.exports = { 
    saveGameData,
    getUserGameData,
    getUserStats,
    getLeaderboard
};