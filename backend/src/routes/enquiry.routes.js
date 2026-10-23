/**
 * Public enquiry routes
 */
const express = require('express');
const { publicWriteLimiter } = require('../middlewares/rateLimit.middleware');

const enquiryController = require('../controllers/enquiryController');

const router = express.Router();

// Apply rate limiting to all public routes
router.use(publicWriteLimiter);

// Enquiry form submission
router.post('/enquiry', enquiryController.submitEnquiry);

module.exports = router;