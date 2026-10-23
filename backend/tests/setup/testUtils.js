/**
 * Test utilities - shared setup functions for tests
 */
const mongoose = require('mongoose');
const { resetRateLimiterStore } = require('../../src/middlewares/rateLimit.middleware');

/**
 * Clear all collections - call in afterEach
 */
async function clearCollections() {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
  // Reset rate limiter store after each test
  resetRateLimiterStore();
}

module.exports = {
  clearCollections
};