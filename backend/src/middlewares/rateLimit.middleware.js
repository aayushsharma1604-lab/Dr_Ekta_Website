/**
 * Rate limiting middleware - Per-IP limits on public write endpoints
 * Stricter limits on enquiry forms vs click logging
 */
const rateLimit = require('express-rate-limit');
const { rateLimit: rateLimitConfig } = require('../config/env');

// Use built-in MemoryStore from express-rate-limit v7+
const { MemoryStore } = rateLimit;

// Track all stores for test reset
const stores = [];

function createStore() {
  const store = new MemoryStore();
  stores.push(store);
  return store;
}

/**
 * Create rate limiter with custom key generator
 * @param {Object} options - Rate limit options
 * @returns {Function} Express middleware
 */
function createRateLimiter(options = {}) {
  const isTest = process.env.NODE_ENV === 'test';
  
  return rateLimit({
    windowMs: options.windowMs || rateLimitConfig.windowMs,
    max: options.max || rateLimitConfig.maxRequests,
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      // Use IP + endpoint for granular limiting
      return `${req.ip}:${req.path}`;
    },
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil(rateLimitConfig.windowMs / 1000)
      });
    },
    skip: options.skip || ((req) => {
      // Skip rate limiting in test environment by default
      // Allow enabling via header for specific tests
      if (isTest) {
        return req.headers['x-enable-rate-limit'] !== 'true';
      }
      return false;
    }),
    store: createStore()
  });
}

/**
 * Reset all rate limiter stores (for testing)
 */
function resetRateLimiterStore() {
  for (const store of stores) {
    if (store && typeof store.resetAll === 'function') {
      store.resetAll();
    }
  }
}

// Pre-configured limiters for different endpoint types
// In test environment, all limiters skip by default (controlled by createRateLimiter)
const publicWriteLimiter = createRateLimiter({
  max: 20, // Stricter for enquiry forms
  windowMs: 60000, // 1 minute
});

const publicReadLimiter = createRateLimiter({
  max: 100,
  windowMs: 60000
});

const authLimiter = createRateLimiter({
  max: 50,
  windowMs: 900000 // 15 minutes for auth endpoints
});

module.exports = {
  createRateLimiter,
  publicWriteLimiter,
  publicReadLimiter,
  authLimiter,
  resetRateLimiterStore
};