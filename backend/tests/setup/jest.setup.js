console.log('Loading jest.setup.js...');

/**
 * Jest global setup - MongoDB Memory Server
 * Spins up an in-memory MongoDB for isolated testing
 */
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { resetRateLimiterStore } = require('../../src/middlewares/rateLimit.middleware');

console.log('jest.setup.js loaded, resetRateLimiterStore:', typeof resetRateLimiterStore);

// Reset rate limiter store before each test suite (test file)
resetRateLimiterStore();

let mongoServer;

/**
 * Global setup - runs once before all tests
 */
beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  // Connect Mongoose
  await mongoose.connect(uri, {
    maxPoolSize: 10
  });
  
  console.log('Test database connected');
});

/**
 * Global teardown - runs once after all tests
 */
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  console.log('Test database disconnected');
});

/**
 * Clear all collections between test files
 */
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
  // Reset rate limiter store
  resetRateLimiterStore();
});

// Reset rate limiter before each test as well
beforeEach(() => {
  resetRateLimiterStore();
});

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_key_for_testing_only';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key_for_testing_only';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.FRONTEND_URL = 'http://localhost:3000';
// Dummy Cloudinary account so signed-upload tests exercise the real signing path
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
process.env.CLOUDINARY_API_KEY = 'test-key';
process.env.CLOUDINARY_API_SECRET = 'test-secret';