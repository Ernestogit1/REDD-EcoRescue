const jwt = require('jsonwebtoken');
const User = require('../../../database/models/user.model');

const authMiddleware = async (req, res, next) => {
  try {
    let token;

    // Try to get token from Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    
    // If no token in header, try to get from cookies
    if (!token && req.cookies && req.cookies.authToken) {
      token = req.cookies.authToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database using the correct field name
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    // Add user to request object
    req.user = {
      _id: user._id, // Make sure to include _id as that's what your controller expects
      userId: user._id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      username: user.username
    };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

module.exports = authMiddleware;