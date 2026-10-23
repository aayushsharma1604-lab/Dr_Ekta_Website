/**
 * Public routes - Unauthenticated endpoints
 * Rate limited, no auth required
 */
const express = require('express');
const { publicReadLimiter } = require('../middlewares/rateLimit.middleware');
const { optionalAuth } = require('../middlewares/auth.middleware');
const clinicInfoController = require('../controllers/clinicInfoController');

const router = express.Router();

// Apply rate limiting to all public routes
router.use(publicReadLimiter);

// Optional auth for endpoints that can benefit from user context
router.use(optionalAuth);

// Public clinic info
router.get('/clinic-info', clinicInfoController.getPublicClinicInfo);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;