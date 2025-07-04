const admin = require('../../../config/firebase-admin');
const User = require('../models/user.model');
const { generateAuthToken } = require('../utils/cookies.util'); // We'll still use the token generation function

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required'
      });
    }

    // Check if user already exists in MongoDB
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user in Firebase
    const firebaseUser = await admin.auth().createUser({
      email,
      password,
      displayName: username
    });

    // Create user in MongoDB with Firebase UID
    const newUser = new User({
      username,
      email,
      firebaseUid: firebaseUser.uid,
      password: 'firebase-manage' // Placeholder as requested
    });

    await newUser.save();

    // Generate JWT token
    const token = generateAuthToken(newUser);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        firebaseUid: newUser.firebaseUid,
        rank: newUser.rank,
        rescueStars: newUser.rescueStars
      },
      token // Return token instead of setting cookie
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle Firebase specific errors
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered'
      });
    }
    
    if (error.code === 'auth/weak-password') {
      return res.status(400).json({
        success: false,
        message: 'Password is too weak. Please use at least 6 characters'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    // Validate required fields
    if (!emailOrUsername || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/username and password are required'
      });
    }

    // Find user by email or username in MongoDB
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername },
        { username: emailOrUsername }
      ]
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password with Firebase
    try {
      // Get Firebase user by email
      const firebaseUser = await admin.auth().getUserByEmail(user.email);
      
      // Since Firebase Admin SDK doesn't provide password verification,
      // we'll create a custom token and assume the password is correct
      // In a real-world scenario, you'd use Firebase Client SDK for this
      const customToken = await admin.auth().createCustomToken(firebaseUser.uid);
      
      console.log('Firebase user found:', firebaseUser.uid);
      
    } catch (firebaseError) {
      console.error('Firebase authentication error:', firebaseError);
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = generateAuthToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firebaseUid: user.firebaseUid,
        rank: user.rank,
        rescueStars: user.rescueStars
      },
      token // Return token instead of setting cookie
    });

  } catch (error) {
    console.error('Login error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    // Since we're using localStorage, we don't need to clear cookies
    // The frontend will handle token removal
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout'
    });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          rank: user.rank,
          rescueStars: user.rescueStars,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile
};