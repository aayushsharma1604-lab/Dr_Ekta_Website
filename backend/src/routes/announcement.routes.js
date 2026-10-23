/**
 * Announcement routes - Public and admin (separate routers to avoid route conflicts)
 */
const express = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { publicReadLimiter } = require('../middlewares/rateLimit.middleware');
const announcementController = require('../controllers/announcementController');

// Public router - only public endpoints
const publicRouter = express.Router();
publicRouter.get('/', publicReadLimiter, announcementController.getPublicAnnouncements);

// Admin router - only admin endpoints (all protected)
const adminRouter = express.Router();
adminRouter.use(authMiddleware);
adminRouter.get('/', announcementController.getAdminAnnouncements);
adminRouter.get('/:id', announcementController.getAnnouncement);
adminRouter.post('/', announcementController.createAnnouncement);
adminRouter.put('/:id', announcementController.updateAnnouncement);
adminRouter.delete('/:id', announcementController.deleteAnnouncement);

module.exports = {
  publicRouter,
  adminRouter
};
