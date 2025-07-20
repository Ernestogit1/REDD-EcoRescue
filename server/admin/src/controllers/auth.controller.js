const admin = require('../../../config/firebase-admin');
const User = require('../../../database/models/user.model');
const { generateAdminToken, setAdminCookieOptions } = require('../utils/generateAdminToken');

const adminLogin = async (req, res) => {
  try {
    const { idToken, email, password } = req.body;

    let user = null;

    // Firebase token authentication
    if (idToken) {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const firebaseUid = decodedToken.uid;

      user = await User.findOne({ 
        firebaseUid,
        isAdmin: true 
      });

      if (!user) {
        return res.status(403).json({ 
          success: false, 
          message: "Access denied. Admin privileges required." 
        });
      }
    }
    // Email/password authentication (for admin@gmail.com)
    else if (email && password) {
      if (email !== 'admin@gmail.com' || password !== 'admin123') {
        return res.status(401).json({
          success: false,
          message: 'Invalid admin credentials'
        });
      }

      user = await User.findOne({ 
        email: 'admin@gmail.com',
        isAdmin: true 
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Admin account not found'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Generate admin token
    const token = generateAdminToken(user);
    const cookieOptions = setAdminCookieOptions();

    res.cookie('adminToken', token, cookieOptions);

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        rank: user.rank
      },
      token
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during admin login'
    });
  }
};

const adminLogout = async (req, res) => {
  try {
    res.clearCookie('adminToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    res.status(200).json({
      success: true,
      message: 'Admin logout successful'
    });
  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout'
    });
  }
};

const getAdminProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');

    if (!user || !user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
          rank: user.rank,
          rescueStars: user.rescueStars,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  adminLogin,
  adminLogout,
  getAdminProfile
};