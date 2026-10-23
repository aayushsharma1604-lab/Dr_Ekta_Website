/**
 * Admin Analytics controller - Monthly reports, analytics
 */
const { asyncHandler } = require('../middlewares/errorHandler.middleware');
const { AnalyticsEvent } = require('../models');

const getMonthlyReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const report = await AnalyticsEvent.getMonthlyReport({ startDate, endDate });
  res.json(report);
});

const getEvents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, eventType, startDate, endDate } = req.query;
  const query = {};
  if (eventType) query.eventType = eventType;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  const [items, total] = await Promise.all([
    AnalyticsEvent.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit)),
    AnalyticsEvent.countDocuments(query)
  ]);
  res.json({ items, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
});

module.exports = { getMonthlyReport, getEvents };