const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for user authentication
 * @param {Object} user - User object from database
 * @returns {string} JWT token
 */
const generateAuthToken = (user) => {
  return jwt.sign(
    { 
      userId: user._id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      username: user.username
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: '7d' // Token expires in 7 days
    }
  );
};

/**
 * Set authentication cookie with generated JWT
 * @param {Object} res - Express response object
 * @param {Object} user - User object to generate token for
 * @param {Object} options - Additional cookie options
 */
const setAuthCookie = (res, user, options = {}) => {
  const token = generateAuthToken(user);
  
  const defaultOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    sameSite: 'strict',
    path: '/'
  };

  const cookieOptions = { ...defaultOptions, ...options };

  res.cookie('authToken', token, cookieOptions);
  
  return token; // Return token in case it's needed
};

/**
 * Set authentication cookie with existing token
 * @param {Object} res - Express response object
 * @param {string} token - JWT token to store
 * @param {Object} options - Additional cookie options
 */
const setAuthCookieWithToken = (res, token, options = {}) => {
  const defaultOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    sameSite: 'strict',
    path: '/'
  };

  const cookieOptions = { ...defaultOptions, ...options };

  res.cookie('authToken', token, cookieOptions);
};

/**
 * Clear authentication cookie
 * @param {Object} res - Express response object
 */
const clearAuthCookie = (res) => {
  res.clearCookie('authToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
};

/**
 * Set refresh token cookie
 * @param {Object} res - Express response object
 * @param {string} refreshToken - Refresh token to store
 */
const setRefreshCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: 'strict',
    path: '/api/auth/refresh'
  });
};

/**
 * Clear refresh token cookie
 * @param {Object} res - Express response object
 */
const clearRefreshCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth/refresh'
  });
};

/**
 * Get cookie options for different environments
 * @param {string} environment - Environment (development, production)
 * @returns {Object} Cookie options
 */
const getCookieOptions = (environment = process.env.NODE_ENV) => {
  const baseOptions = {
    httpOnly: true,
    sameSite: 'strict',
    path: '/'
  };

  if (environment === 'production') {
    return {
      ...baseOptions,
      secure: true,
      domain: process.env.COOKIE_DOMAIN || undefined
    };
  }

  return {
    ...baseOptions,
    secure: false
  };
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyAuthToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

module.exports = {
  generateAuthToken,
  setAuthCookie,
  setAuthCookieWithToken,
  clearAuthCookie,
  setRefreshCookie,
  clearRefreshCookie,
  getCookieOptions,
  verifyAuthToken
};