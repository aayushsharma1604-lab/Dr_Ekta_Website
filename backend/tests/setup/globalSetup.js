/**
 * Jest global setup - MongoDB Memory Server
 * Runs once before all tests
 */
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

module.exports = async function globalSetup() {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  // Connect Mongoose
  await mongoose.connect(uri, {
    maxPoolSize: 10
  });
  
  // Store reference for teardown
  global.__MONGO_SERVER__ = mongoServer;
  global.__MONGO_URI__ = uri;
  
  console.log('Test database connected');
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_ACCESS_SECRET = 'test_access_secret_key_for_testing_only';
  process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key_for_testing_only';
  process.env.MONGODB_URI = uri;
  process.env.FRONTEND_URL = 'http://localhost:3000';
  // Dummy Cloudinary account so signed-upload tests exercise the real signing path
  process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
  process.env.CLOUDINARY_API_KEY = 'test-key';
  process.env.CLOUDINARY_API_SECRET = 'test-secret';
};