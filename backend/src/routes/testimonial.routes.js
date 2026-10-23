/**
 * Testimonial routes - Public and admin (separate routers to avoid route conflicts - F15)
 * Single-admin draft/published model (R3): no review workflow routes
 */
const express = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { publicReadLimiter } = require('../middlewares/rateLimit.middleware');
const testimonialController = require('../controllers/testimonialController');

// Public router - only public endpoints
const publicRouter = express.Router();
publicRouter.get('/', publicReadLimiter, testimonialController.getPublicTestimonials);

// Admin router - only admin endpoints (all protected)
const adminRouter = express.Router();
adminRouter.use(authMiddleware);
adminRouter.get('/', testimonialController.getAdminTestimonials);
adminRouter.get('/:id', testimonialController.getTestimonial);
adminRouter.post('/', testimonialController.createTestimonial);
adminRouter.put('/:id', testimonialController.updateTestimonial);
adminRouter.delete('/:id', testimonialController.deleteTestimonial);

module.exports = {
  publicRouter,
  adminRouter
};
