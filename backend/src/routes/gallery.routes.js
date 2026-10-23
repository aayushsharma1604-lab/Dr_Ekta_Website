/**
 * Gallery routes - Public and admin (separate routers to avoid route conflicts - F15)
 * Single-admin draft/published model (R3): no review workflow routes
 */
const express = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { publicReadLimiter } = require('../middlewares/rateLimit.middleware');
const galleryController = require('../controllers/galleryController');

// Public router - only public endpoints
const publicRouter = express.Router();
publicRouter.get('/', publicReadLimiter, galleryController.getPublicGallery);

// Admin router - only admin endpoints (all protected)
const adminRouter = express.Router();
adminRouter.use(authMiddleware);
adminRouter.get('/', galleryController.getAdminGallery);
adminRouter.get('/:id', galleryController.getGalleryItem);
adminRouter.post('/', galleryController.createGalleryItem);
adminRouter.put('/:id', galleryController.updateGalleryItem);
adminRouter.delete('/:id', galleryController.deleteGalleryItem);

module.exports = {
  publicRouter,
  adminRouter
};
