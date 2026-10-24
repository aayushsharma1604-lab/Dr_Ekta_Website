/**
 * Vercel serverless function handler for Express backend
 * Exports the Express app as the default serverless handler
 */
const { app } = require('../src/app');

// Export the Express app as the Vercel serverless handler
module.exports = app;