/**
 * CuratedPost routes - Public and admin (separate routers to avoid route conflicts - F15)
 */
const express = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { publicReadLimiter } = require('../middlewares/rateLimit.middleware');
const curatedPostController = require('../controllers/curatedPostController');

// Public router - only public endpoints
const publicRouter = express.Router();
publicRouter.get('/', publicReadLimiter, curatedPostController.getPublicCuratedPosts);

// Admin router - only admin endpoints (all protected)
const adminRouter = express.Router();
adminRouter.use(authMiddleware);
adminRouter.get('/', curatedPostController.getAdminCuratedPosts);
adminRouter.get('/:id', curatedPostController.getCuratedPost);
adminRouter.post('/', curatedPostController.createCuratedPost);
adminRouter.put('/:id', curatedPostController.updateCuratedPost);
adminRouter.delete('/:id', curatedPostController.deleteCuratedPost);

module.exports = {
  publicRouter,
  adminRouter
};
