/**
 * Video routes - Public and admin (separate routers to avoid route conflicts)
 */
const express = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { publicReadLimiter } = require('../middlewares/rateLimit.middleware');
const videoController = require('../controllers/videoController');

// Public router - only public endpoints
const publicRouter = express.Router();
publicRouter.get('/', publicReadLimiter, videoController.getPublicVideos);

// Admin router - only admin endpoints (all protected)
const adminRouter = express.Router();
adminRouter.use(authMiddleware);
adminRouter.get('/', videoController.getAdminVideos);
adminRouter.get('/:id', videoController.getVideo);
adminRouter.post('/', videoController.createVideo);
adminRouter.put('/:id', videoController.updateVideo);
adminRouter.delete('/:id', videoController.deleteVideo);

module.exports = {
  publicRouter,
  adminRouter
};