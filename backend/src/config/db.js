/**
 * Database connection setup - single shared Mongoose connection pool
 * Configures connection options for production readiness
 */
const mongoose = require('mongoose');
const { mongodbUri } = require('./env');

let isConnected = false;

/**
 * Connect to MongoDB with retry logic and connection pooling
 * @returns {Promise<mongoose.Connection>} Mongoose connection
 */
async function connectDB() {
  if (isConnected) {
    return mongoose.connection;
  }

  // Serverless (Vercel) spins up many short-lived instances, so each must hold few
  // connections or the Atlas connection limit is exhausted. A long-lived server can afford more.
  const serverless = Boolean(process.env.VERCEL);

  try {
    await mongoose.connect(mongodbUri, {
      maxPoolSize: serverless ? 5 : 20,
      minPoolSize: serverless ? 0 : 10,
      retryWrites: true,
      w: 'majority',
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });

    isConnected = true;
    console.log('MongoDB connected successfully');

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
      isConnected = false;
    });

    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw error;
  }
}

/**
 * Gracefully close the database connection
 * @returns {Promise<void>}
 */
async function disconnectDB() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('MongoDB disconnected gracefully');
  }
}

module.exports = { connectDB, disconnectDB };