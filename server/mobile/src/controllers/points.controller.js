const User = require('../../../database/models/user.model');

exports.addPoints = async (req, res) => {
  try {
    const { points } = req.body;
    const userId = req.user.userId; // set by auth middleware

    console.log('addPoints called:', { userId, points });

    if (typeof points !== 'number') {
      console.log('Invalid points type:', typeof points);
      return res.status(400).json({ message: 'Points must be a number.' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { points } },
      { new: true }
    );

    if (!user) {
      console.log('User not found for id:', userId);
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ points: user.points });
  } catch (err) {
    console.log('Error in addPoints:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
