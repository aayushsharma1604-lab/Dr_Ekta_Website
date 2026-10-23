/**
 * Admin routes - All protected admin endpoints
 * Auth routes are public (no auth required), other routes require auth
 */
const express = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { authLimiter } = require('../middlewares/rateLimit.middleware');

const authController = require('../controllers/authController');
const clinicInfoController = require('../controllers/clinicInfoController');
const mediaController = require('../controllers/mediaController');

const router = express.Router();

// Auth routes (public - no auth required, but rate limited)
router.post('/auth/login', authLimiter, authController.login);
router.post('/auth/refresh', authLimiter, authController.refresh);
router.post('/auth/logout', authController.logout);

// Authenticated admin profile (requires valid session - see F14 fix)
router.get('/auth/me', authMiddleware, authController.me);

// Apply auth middleware to all routes below this line
router.use(authMiddleware);

// Clinic Info
router.get('/clinic-info', clinicInfoController.getAdminClinicInfo);
router.put('/clinic-info', clinicInfoController.updateClinicInfo);

// Media
router.post('/media/upload', mediaController.getUploadUrl);
router.post('/media/confirm', mediaController.confirmUpload);
router.get('/media', mediaController.listMedia);
router.get('/media/:id', mediaController.getMedia);
router.delete('/media/:id', mediaController.deleteMedia);

module.exports = router;