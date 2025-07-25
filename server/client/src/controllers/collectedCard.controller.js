const CollectedCard = require('../../../database/models/collectedCard.model');
const LevelCompletion = require('../../../database/models/levelCompletion.model');

// Collect a card for a user after finishing a level
const collectCard = async (req, res) => {
  try {
    const userId = req.user._id;
    const { levelId, name, image, description } = req.body;

    if (!levelId || !name || !image || !description) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user has completed the level
    const completed = await LevelCompletion.findOne({ userId, levelId });
    if (!completed) {
      return res.status(403).json({ message: 'You must finish the level before collecting the card.' });
    }

    // Try to create a new collected card, enforcing uniqueness
    const collectedCard = new CollectedCard({
      userId,
      levelId,
      name,
      image,
      description,
    });

    await collectedCard.save();

    // Update user rank based on number of collected cards
    const cardCount = await CollectedCard.countDocuments({ userId });
    let newRank = 'Novice';
    if (cardCount > 0 && cardCount <= 5) {
      newRank = 'Beginner';
    }
    else if (cardCount > 5 && cardCount <= 10) {
      newRank = 'Great Collector';
    } else if (cardCount > 10 && cardCount <= 15) {
      newRank = 'Expert';
    }
    // Update the user's rank if it has changed
    const User = require('../../../database/models/user.model');
    const user = await User.findById(userId);
    if (user && user.rank !== newRank) {
      user.rank = newRank;
      await user.save();
    }
    return res.status(201).json({ message: 'Card collected successfully', card: collectedCard });
  } catch (error) {
    // Duplicate key error (already collected)
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Card for this level already collected by user' });
    }
    console.error('Error collecting card:', error);
    return res.status(500).json({ message: 'Error collecting card', error });
  }
};

// Get all collected cards for the authenticated user
const getUserCollectedCards = async (req, res) => {
  try {
    const userId = req.user._id;
    const cards = await CollectedCard.find({ userId }).sort({ collectedAt: -1 });
    return res.status(200).json({ cards });
  } catch (error) {
    console.error('Error fetching collected cards:', error);
    return res.status(500).json({ message: 'Error fetching collected cards', error });
  }
};

module.exports = { collectCard, getUserCollectedCards }; 