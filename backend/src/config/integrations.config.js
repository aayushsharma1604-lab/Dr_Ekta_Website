/**
 * Third-party integration configuration
 * Centralizes all external API keys and settings
 * Cloudinary lives under storage.cloudinary in env (F4 fix)
 */
const { storage, practo, googleAnalytics } = require('./env');

module.exports = {
  storage,
  practo,
  googleAnalytics,
  cloudinary: storage.cloudinary
};