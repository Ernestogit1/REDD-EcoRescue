const jwt = require('jsonwebtoken');
const User = require('../../../database/models/user.model');

const adminAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.adminToken || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required for admin access'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if token is admin type
    if (decoded.type !== 'admin' || !decoded.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Verify user still exists and is admin
    const user = await User.findById(decoded.userId).select('-password');

    if (!user || !user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    req.user = {
      userId: user._id,
      email: user.email,
      username: user.username,
      isAdmin: user.isAdmin
    };

    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Admin token expired'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during admin authentication'
    });
  }
};

module.exports = adminAuthMiddleware;