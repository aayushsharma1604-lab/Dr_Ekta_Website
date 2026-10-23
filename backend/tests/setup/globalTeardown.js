/**
 * Jest global teardown - MongoDB Memory Server cleanup
 * Runs once after all tests
 */
const mongoose = require('mongoose');

module.exports = async function globalTeardown() {
  await mongoose.disconnect();
  
  if (global.__MONGO_SERVER__) {
    await global.__MONGO_SERVER__.stop();
  }
  
  console.log('Test database disconnected');
};