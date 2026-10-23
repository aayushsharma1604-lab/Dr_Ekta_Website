/**
 * Test fixtures and helpers
 * Reusable test data and utility functions
 * Models are lazy-loaded to avoid connection issues during test setup
 */
let User, MediaAsset;

/**
 * Get models (lazy-loaded)
 */
function getModels() {
  if (!User) {
    ({ User, MediaAsset } = require('../../src/models'));
  }
  return { User, MediaAsset };
}

/**
 * Create a test user
 * @param {Object} overrides - Fields to override
 * @returns {Promise<User>}
 */
async function createTestUser(overrides = {}) {
  const { User } = getModels();
  const uniqueEmail = `test${Date.now()}${Math.random().toString(36).substr(2, 9)}@example.com`;
  return User.create({
    name: 'Test Admin',
    email: uniqueEmail,
    passwordHash: 'TestPass123!', // Will be hashed by pre-save hook
    status: 'active',
    ...overrides
  });
}

/**
 * Create authenticated request headers
 * @param {string} accessToken - JWT access token
 * @returns {Object} Headers object
 */
function authHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };
}

/**
 * Create test media asset
 * @param {ObjectId} userId - Uploading user ID
 * @param {Object} overrides - Fields to override
 * @returns {Promise<MediaAsset>}
 */
async function createTestMediaAsset(userId, overrides = {}) {
  const { MediaAsset } = getModels();
  return MediaAsset.create({
    filename: 'test-image.jpg',
    originalName: 'test-image.jpg',
    storageKey: 'uploads/test-image.jpg',
    url: 'https://example.com/test-image.jpg',
    mimeType: 'image/jpeg',
    size: 1024,
    uploadedBy: userId,
    ...overrides
  });
}

/**
 * Login and get tokens
 * @param {Object} app - Express app
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Login response
 */
async function loginAndGetTokens(app, email, password) {
  const request = require('supertest');
  const body = { email, password };
  
  const res = await request(app)
    .post('/api/admin/auth/login')
    .send(body);
  
  return res.body;
}

module.exports = {
  createTestUser,
  authHeaders,
  createTestMediaAsset,
  loginAndGetTokens
};