const Save = require('../../../database/models/card.model');
const User = require('../../../database/models/user.model');

const saveGameData = async (req, res) => {
    const { gameDate, failed, difficulty, completed, timeTaken } = req.body;
    const userId = req.user._id;

    try {
       
        if (!userId || !gameDate || difficulty === undefined || completed === undefined || timeTaken === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newSave = new Save({
            userId,
            gameDate,
            failed,
            difficulty,
            completed,
            timeTaken,
        });

        await newSave.save(); 
        res.status(201).json({ message: 'Game data saved successfully' });
    } catch (error) {
        console.error('Error saving game data:', error);
        res.status(500).json({ message: 'Error saving game data', error });
    }
};

const getUserGameData = async (req, res) => {
    try {
        const userId = req.user._id;
        const gameData = await Save.find({ userId })
            .sort({ gameDate: -1 }) // Sort by date, newest first
            .select('-__v'); // Exclude version key

        if (!gameData.length) {
            return res.status(200).json({ message: 'No game data found', data: [] });
        }

        res.status(200).json(gameData);
    } catch (error) {
        console.error('Error fetching user game data:', error);
        res.status(500).json({ message: 'Error fetching game data', error });
    }
};

const getUserStats = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const stats = await Save.aggregate([
            { $match: { userId: userId } },
            { $group: {
                _id: '$difficulty',
                gamesPlayed: { $sum: 1 },
                averageTimeTaken: { $avg: '$timeTaken' },
                totalFailed: { $sum: '$failed' },
                completedGames: { $sum: '$completed' }
            }},
            { $sort: { _id: 1 } }
        ]);

        if (!stats.length) {
            return res.status(200).json({ 
                message: 'No stats available', 
                data: [] 
            });
        }

        res.status(200).json(stats);
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ message: 'Error fetching stats', error });
    }
};

const getLeaderboard = async (req, res) => {
    try {
        console.log('Fetching card leaderboard...');
        
        const leaderboard = await Save.aggregate([
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
                    completedGames: { $sum: '$completed' },
                    totalGames: { $sum: 1 },
                    averageTime: { $avg: '$timeTaken' },
                    bestTime: { $min: '$timeTaken' },
                    totalFailed: { $sum: '$failed' }
                }
            },
            { $sort: { completedGames: -1, averageTime: 1 } },
            { $limit: 50 }
        ]);

        console.log('Card leaderboard data:', leaderboard);
        res.status(200).json(leaderboard);
    } catch (error) {
        console.error('Error fetching card leaderboard:', error);
        res.status(500).json({ message: 'Error fetching leaderboard', error });
    }
};

module.exports = { 
    saveGameData,
    getUserGameData,
    getUserStats,
    getLeaderboard
};