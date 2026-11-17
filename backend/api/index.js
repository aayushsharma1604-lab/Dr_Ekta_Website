/**
 * Vercel serverless entry point.
 * Each function instance is short-lived and may serve several requests,
 * so the Mongo connection is opened once per instance and reused.
 */
const { app } = require('../src/app');
const { connectDB } = require('../src/config/db');

let dbPromise = null;

function ensureDB() {
  if (!dbPromise) {
    dbPromise = connectDB().catch((err) => {
      dbPromise = null; // retry on the next request instead of caching the failure
      throw err;
    });
  }
  return dbPromise;
}

module.exports = async (req, res) => {
  try {
    await ensureDB();
  } catch (err) {
    console.error('Database unavailable:', err.message);
    return res.status(503).json({ error: 'Service temporarily unavailable' });
  }
  return app(req, res);
};
