/**
 * Auth service - Core authentication business logic
 * Handles login, token generation, password management
 */
const jwt = require('jsonwebtoken');
const { User, RefreshToken } = require('../models');
const { jwt: jwtConfig } = require('../config/env');
const { AppError } = require('../middlewares/errorHandler.middleware');

/**
 * Generate access and refresh token pair
 * @param {User} user - User document
 * @returns {Object} Token pair
 */
function generateTokens(user) {
  const payload = { sub: user._id.toString(), email: user.email, jti: require('crypto').randomBytes(16).toString('hex') };
  const accessToken = jwt.sign(payload, jwtConfig.accessSecret, { expiresIn: jwtConfig.accessExpiry });
  const refreshToken = jwt.sign(payload, jwtConfig.refreshSecret, { expiresIn: jwtConfig.refreshExpiry });
  return { accessToken, refreshToken };
}

/**
 * Hash a token for storage
 * @param {string} token - Plain token
 * @returns {string} Hashed token
 */
function hashToken(token) {
  return require('crypto').createHash('sha256').update(token).digest('hex');
}

/**
 * Verify access token
 * @param {string} token - Access token
 * @returns {Object|null} Decoded payload or null
 */
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, jwtConfig.accessSecret);
  } catch (e) {
    return null;
  }
}

/**
 * Verify refresh token
 * @param {string} token - Refresh token
 * @returns {Object|null} Decoded payload or null
 */
function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, jwtConfig.refreshSecret);
  } catch (e) {
    return null;
  }
}

/**
 * Login user with credentials
 * @param {string} email - User email
 * @param {string} password - Plain password
 * @param {string} ip - Client IP
 * @param {string} userAgent - Client user agent
 * @returns {Promise<Object>} Login result with tokens
 */
async function login(email, password, ip, userAgent) {
  try {
    // Normalize exactly how the User model stores email (lowercase + trim,
    // dots preserved) so lookup can't miss due to case/whitespace.
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
    
    if (!user) {
      throw new AppError('Invalid credentials', 401, 'AUTHENTICATION_ERROR');
    }

    if (user.status !== 'active') {
      throw new AppError('Invalid credentials', 401, 'AUTHENTICATION_ERROR');
    }

    if (user.isLocked) {
      throw new AppError('Account temporarily locked. Try again later.', 429, 'RATE_LIMIT_ERROR');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      throw new AppError('Invalid credentials', 401, 'AUTHENTICATION_ERROR');
    }

    await user.resetLoginAttempts();
    const { accessToken, refreshToken } = generateTokens(user);

    // Store refresh token hash
    const tokenHash = hashToken(refreshToken);
    await RefreshToken.create({
      tokenHash,
      userId: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ip,
      userAgent
    });

    return {
      user: { id: user._id, name: user.name, email: user.email },
      accessToken,
      refreshToken
    };
  } catch (error) {
    // Re-throw operational errors
    if (error.isOperational) throw error;
    // Wrap unexpected errors
    throw new AppError(error.message || 'Login failed', 500, 'INTERNAL_ERROR', { originalError: error.message });
  }
}

/**
 * Refresh access token using refresh token
 * @param {string} refreshToken - Refresh token
 * @param {string} ip - Client IP
 * @param {string} userAgent - Client user agent
 * @returns {Promise<Object>} New token pair
 */
async function refreshAccessToken(refreshToken, ip, userAgent) {
  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    throw new AppError('Invalid or expired refresh token', 401, 'AUTHENTICATION_ERROR');
  }

  const tokenHash = hashToken(refreshToken);
  const storedToken = await RefreshToken.findOne({ tokenHash, userId: decoded.sub });
  
  if (!storedToken || !storedToken.isValid()) {
    throw new AppError('Refresh token revoked or expired', 401, 'AUTHENTICATION_ERROR');
  }

  const user = await User.findById(decoded.sub);
  if (!user || user.status !== 'active') {
    throw new AppError('User not found or disabled', 401, 'AUTHENTICATION_ERROR');
  }

  // Rotate refresh token - revoke old, issue new
  await storedToken.revoke();
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
  
  const newTokenHash = hashToken(newRefreshToken);
  await RefreshToken.create({
    tokenHash: newTokenHash,
    userId: user._id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    ip,
    userAgent
  });

  return { accessToken, refreshToken: newRefreshToken };
}

/**
 * Logout - revoke refresh token
 * @param {string} refreshToken - Refresh token to revoke
 */
async function logout(refreshToken) {
  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) return;

  const tokenHash = hashToken(refreshToken);
  await RefreshToken.findOneAndUpdate(
    { tokenHash, userId: decoded.sub },
    { revoked: true }
  );
}

/**
 * Get user by ID (for middleware)
 * @param {ObjectId} userId - User ID
 * @returns {Promise<User|null>}
 */
async function getUserById(userId) {
  return User.findById(userId);
}

module.exports = {
  generateTokens,
  hashToken,
  verifyAccessToken,
  verifyRefreshToken,
  login,
  refreshAccessToken,
  logout,
  getUserById
};