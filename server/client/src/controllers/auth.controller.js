const admin = require('../../../config/firebase-admin');
const User = require('../../../database/models/user.model');
const { generateAuthToken } = require('../utils/cookies.util'); 

const registerUser = async (req, res) => {
  try {
    const { username, email, firebaseUid } = req.body;

    if (!username || !email || !firebaseUid) {
      return res.status(400).json({
        success: false,
        message: "Username, email, and firebaseUid are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const newUser = new User({
      username,
      email,
      firebaseUid,
      password: "firebase-manage",
    });

    await newUser.save();

    const token = generateAuthToken(newUser);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        firebaseUid: newUser.firebaseUid,
        rank: newUser.rank,
        rescueStars: newUser.rescueStars,
      },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


const loginUser = async (req, res) => {
  try {
    const { idToken, emailOrUsername, password } = req.body;

    // 🔁 Mode 1: If idToken is provided (frontend has already logged into Firebase)
    if (idToken) {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const firebaseUid = decodedToken.uid;

      const user = await User.findOne({ firebaseUid });

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found in DB" });
      }

      const token = generateAuthToken(user);

      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firebaseUid: user.firebaseUid,
          rank: user.rank,
          rescueStars: user.rescueStars,
        },
      });
    }

    // 🔁 Mode 2: Frontend is asking for user's real email before Firebase login
    if (emailOrUsername && password) {
      const user = await User.findOne({
        $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
      });

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      // Only return email to allow Firebase to handle password validation
      return res.status(200).json({ email: user.email });
    }

    return res.status(400).json({ success: false, message: "Missing login input" });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
};



const logoutUser = async (req, res) => {
  try {
   
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