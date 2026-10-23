/**
 * Practo controller - Handles Practo integration
 * Manages booking provider config and click tracking
 */
const { asyncHandler } = require('../middlewares/errorHandler.middleware');
const { validators } = require('../middlewares/validate.middleware');
const { NotFoundError } = require('../middlewares/errorHandler.middleware');
const { BookingProviderConfig, Lead } = require('../models');
const leadService = require('../services/leadService');

/**
 * GET /api/public/booking-cta - Get active booking CTA
 * Frontend uses this to get the current booking URL
 */
const getBookingCta = async (req, res) => {
  const config = await BookingProviderConfig.getActive();
  if (!config || !config.isActive) {
    return res.status(404).json({ error: 'No active booking provider configured' });
  }
  
  res.json({
    provider: config.providerName,
    profileUrl: config.profileUrl,
    bookingUrl: config.bookingUrl
  });
};

/**
 * POST /api/public/leads/practo-click - Log Practo click
 * Optional click logging for analytics
 */
const logPractoClick = async (req, res) => {
  try {
    // Create lead with source="practo_click"
    const lead = await require('../services/leadService').createLead(
      {
        name: 'Practo Click',
        phone: 'unknown',
        treatmentInterest: null
      },
      'practo_click',
      req.ip,
      req.get('user-agent') || ''
    );

    // Persist server-side analytics event (best effort, never fails the request)
    try {
      await require('../models').AnalyticsEvent.logEvent({
        eventType: 'practo_click',
        refId: lead._id,
        refModel: 'Lead',
        metadata: { source: 'practo_click' },
        ip: req.ip,
        userAgent: req.get('user-agent') || ''
      });
    } catch (eventErr) {
      console.error('Failed to log practo-click analytics event:', eventErr.message);
    }
    
    res.status(200).json({ message: 'Click logged' });
  } catch (err) {
    // Silently fail - click logging is fire-and-forget
    console.error('Practo click log error:', err);
    res.status(200).json({ message: 'Click logged' });
  }
};

/**
 * GET /api/admin/booking-provider - Get booking provider config
 */
const getBookingProvider = async (req, res) => {
  const config = await BookingProviderConfig.getActive();
  if (!config) {
    return res.status(404).json({ error: 'No booking provider configured' });
  }
  
  res.json(config);
};

/**
 * PUT /api/admin/booking-provider - Update booking provider config
 */
const updateBookingProvider = async (req, res) => {
  const { providerName, profileUrl, bookingUrl, isActive } = req.body;
  
  const config = await BookingProviderConfig.getOrCreate();
  
  config.providerName = providerName || 'practo';
  config.profileUrl = profileUrl;
  config.bookingUrl = bookingUrl;
  config.isActive = isActive !== undefined ? isActive : true;
  
  await config.save();
  
  res.json(config);
};

/**
 * GET /api/admin/practo-clicks - Get Practo click analytics
 */
const getPractoClicks = async (req, res) => {
  const { startDate, endDate } = req.query;
  
  const matchStage = { source: 'practo_click' };
  if (startDate || endDate) {
    matchStage.date = {};
    if (startDate) matchStage.date.$gte = new Date(startDate);
    if (endDate) matchStage.date.$lte = new Date(endDate);
  }
  
  const count = await require('../models').Lead.countDocuments(matchStage);
  
  const dailyStats = await require('../models').Lead.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: -1 } },
    { $limit: 30 }
  ]);
  
  res.json({
    totalClicks: count,
    dailyStats
  });
};

module.exports = {
  getBookingCta,
  logPractoClick,
  getBookingProvider,
  updateBookingProvider,
  getPractoClicks
};