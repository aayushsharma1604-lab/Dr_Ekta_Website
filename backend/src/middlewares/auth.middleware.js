/**
 * Authentication middleware - single admin
 * Validates JWT access token and attaches the admin user to the request
 */
const { verifyAccessToken, getUserById } = require('../services/authService');

/**
 * Extract token from Authorization header
 * @param {Request} req - Express request
 * @returns {string|null} Token or null
 */
function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

/**
 * Admin authentication middleware
 * Verifies access token, attaches user to request (single admin: valid session = allowed)
 */
async function authMiddleware(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const user = await getUserById(decoded.sub);
    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: 'User not found or disabled' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
}

/**
 * Optional auth - attaches user if token present, doesn't require it
 */
async function optionalAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (token) {
      const decoded = verifyAccessToken(token);
      if (decoded) {
        const user = await getUserById(decoded.sub);
        if (user && user.status === 'active') {
          req.user = user;
        }
      }
    }
    next();
  } catch (error) {
    next();
  }
}

module.exports = {
  authMiddleware,
  optionalAuth
};
