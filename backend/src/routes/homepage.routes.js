/**
 * Homepage routes - Public and admin
 */
const express = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { publicReadLimiter } = require('../middlewares/rateLimit.middleware');
const { validators } = require('../middlewares/validate.middleware');
const homepageController = require('../controllers/homepageController');

const router = express.Router();

// Public route
router.get('/', publicReadLimiter, homepageController.getHomepage);

// Admin routes (protected)
router.use(authMiddleware);
router.get('/config', homepageController.getHomepageConfig);
router.put('/config', validators.homepageConfig, homepageController.updateHomepageConfig);

module.exports = router;