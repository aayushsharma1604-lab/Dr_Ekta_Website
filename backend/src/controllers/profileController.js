/**
 * Profile controller - About / Meet Dr. Ekta singleton
 * Simple read/write singleton — no approval workflow
 */
const { asyncHandler } = require('../middlewares/errorHandler.middleware');
const { validators, sanitizeRichText } = require('../middlewares/validate.middleware');
const { AppError } = require('../middlewares/errorHandler.middleware');
const { Profile } = require('../models');

/**
 * GET /api/public/profile - Public profile (cached)
 */
const getPublicProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.getSingleton();
  res.json(profile);
});

/**
 * GET /api/admin/profile - Admin profile
 */
const getAdminProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.getSingleton();
  res.json(profile);
});

/**
 * PUT /api/admin/profile - Update profile (admin)
 */
const updateProfile = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (typeof data.bio === 'string') {
    data.bio = sanitizeRichText(data.bio); // XSS guard - F7
  }
  const profile = await Profile.updateSingleton(data, req.user._id);
  const populated = await Profile.findById(profile._id).populate('photo video');
  res.json(populated);
});

module.exports = {
  getPublicProfile,
  getAdminProfile,
  updateProfile: [
    validators.profile,
    updateProfile
  ]
};