/**
 * Auth controller - Handles authentication endpoints
 * Thin layer: validates request, calls service, formats response
 */
const { asyncHandler } = require('../middlewares/errorHandler.middleware');
const { validators } = require('../middlewares/validate.middleware');
const { logger } = require('../utils/logger');
const authService = require('../services/authService');

/**
 * POST /api/admin/auth/login
 * Login with email, password
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip;
  const userAgent = req.get('user-agent') || '';

  const result = await authService.login(email, password, ip, userAgent);

  // Set refresh token as httpOnly cookie (optional, also returned in body)
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken
  });
});

/**
 * POST /api/admin/auth/refresh
 * Refresh access token using refresh token
 */
const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
  
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }

  const ip = req.ip;
  const userAgent = req.get('user-agent') || '';

  const tokens = await authService.refreshAccessToken(refreshToken, ip, userAgent);

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
});

/**
 * POST /api/admin/auth/logout
 * Revoke refresh token
 */
const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
  
  if (refreshToken) {
    await authService.logout(refreshToken);
  }

  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
});

/**
 * GET /api/admin/auth/me
 * Get current user profile
 */
const me = asyncHandler(async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      lastLogin: req.user.lastLogin
    }
  });
});

module.exports = {
  login: [validators.login, login],
  refresh: [validators.refreshToken, refresh],
  logout,
  me
};