/**
 * Profile routes - Public and admin (separate routers to avoid route conflicts - F15)
 */
const express = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const profileController = require('../controllers/profileController');

// Public router - only public endpoints
const publicRouter = express.Router();
publicRouter.get('/', profileController.getPublicProfile);

// Admin router - only admin endpoints (all protected)
const adminRouter = express.Router();
adminRouter.use(authMiddleware);
adminRouter.get('/', profileController.getAdminProfile);
adminRouter.put('/', profileController.updateProfile);

module.exports = {
  publicRouter,
  adminRouter
};
