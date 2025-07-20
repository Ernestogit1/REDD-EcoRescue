const jwt = require('jsonwebtoken');

const generateAdminToken = (user) => {
  return jwt.sign(
    { 
      userId: user._id,
      email: user.email,
      username: user.username,
      isAdmin: user.isAdmin,
      type: 'admin'
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const setAdminCookieOptions = () => {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
  };
};

module.exports = {
  generateAdminToken,
  setAdminCookieOptions
};