const jwt = require('jsonwebtoken');

const generateAuthToken = (user) => {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined in environment variables');
    throw new Error('JWT_SECRET is not configured');
  }

  const payload = {
    userId: user._id,
    firebaseUid: user.firebaseUid,
    email: user.email,
    username: user.username
  };

  console.log('Generating token with payload:', { ...payload, userId: !!payload.userId });

  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const setCookieOptions = () => {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  };

  console.log('Cookie options:', {
    ...options,
    NODE_ENV: process.env.NODE_ENV
  });

  return options;
};

module.exports = {
  generateAuthToken,
  setCookieOptions
};