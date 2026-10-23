/**
 * Practo routes - Public and admin
 */
const express = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { publicReadLimiter } = require('../middlewares/rateLimit.middleware');
const { validators } = require('../middlewares/validate.middleware');
const practoController = require('../controllers/practoController');

const router = express.Router();

// Public routes with rate limiting
router.get('/booking-cta', publicReadLimiter, practoController.getBookingCta);
router.post('/leads/practo-click', publicReadLimiter, practoController.logPractoClick);

// Admin routes (protected)
router.use(authMiddleware);
router.get('/booking-provider', practoController.getBookingProvider);
router.put('/booking-provider', validators.bookingProvider, practoController.updateBookingProvider);
router.get('/practo-clicks', practoController.getPractoClicks);

module.exports = router;