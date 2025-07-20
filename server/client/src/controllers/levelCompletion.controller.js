const LevelCompletion = require('../../../database/models/levelCompletion.model');

// Mark a level as completed for a user
const completeLevel = async (req, res) => {
  try {
    const userId = req.user._id;
    const { levelId } = req.body;
    if (!levelId) {
      return res.status(400).json({ message: 'Missing levelId' });
    }
    // Try to create a new completion record
    const completion = new LevelCompletion({ userId, levelId });
    await completion.save();
    return res.status(201).json({ message: 'Level marked as completed', completion });
  } catch (error) {
    // Duplicate key error (already completed)
    if (error.code === 11000) {
      return res.status(200).json({ message: 'Level already marked as completed' });
    }
    console.error('Error marking level as completed:', error);
    return res.status(500).json({ message: 'Error marking level as completed', error });
  }
};

// Fetch all completed levels for a user
const getCompletedLevels = async (req, res) => {
  try {
    const userId = req.user._id;
    const completions = await LevelCompletion.find({ userId });
    // Return just the levelIds for simplicity
    const completedLevelIds = completions.map(c => c.levelId);
    return res.status(200).json({ completedLevels: completedLevelIds });
  } catch (error) {
    console.error('Error fetching completed levels:', error);
    return res.status(500).json({ message: 'Error fetching completed levels', error });
  }
};

module.exports = { completeLevel, getCompletedLevels }; 