/**
 * Lead service - Business logic for lead management
 * Handles CRUD, status updates, and CSV export
 */
const { Lead, Treatment } = require('../models');
const { AppError } = require('../middlewares/errorHandler.middleware');

/**
 * Create a new lead from enquiry form
 * @param {Object} data - Lead data
 * @param {string} source - Lead source
 * @param {string} ip - Client IP
 * @param {string} userAgent - Client user agent
 * @returns {Promise<Lead>}
 */
async function createLead(data, source, ip, userAgent) {
  // Validate treatment interest if provided
  if (data.treatmentInterest) {
    const treatment = await Treatment.findById(data.treatmentInterest);
    if (!treatment) {
      throw new AppError('Invalid treatment interest', 400, 'VALIDATION_ERROR');
    }
  }

  const lead = await Lead.create({
    ...data,
    source,
    date: new Date()
  });

  return lead;
}

/**
 * Get leads with filtering and pagination
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated results
 */
async function getLeads(options = {}) {
  return Lead.getLeads(options);
}

/**
 * Update lead status or notes
 * @param {ObjectId} id - Lead ID
 * @param {Object} data - Update data
 * @param {ObjectId} actorId - Admin user ID
 * @param {string} ip - Client IP
 * @param {string} userAgent - Client user agent
 * @returns {Promise<Lead>}
 */
async function updateLead(id, data, actorId, ip, userAgent) {
  const lead = await Lead.findById(id);
  if (!lead) {
    throw new AppError('Lead not found', 404, 'NOT_FOUND');
  }

  const updatedLead = await Lead.updateLead(id, data);

  return updatedLead;
}

/**
 * Get lead statistics for dashboard
 * @param {Object} filter - Filter criteria
 * @returns {Promise<Object>} Statistics
 */
async function getLeadStats(filter = {}) {
  const matchStage = {};
  
  if (filter.source) matchStage.source = filter.source;
  if (filter.startDate || filter.endDate) {
    matchStage.date = {};
    if (filter.startDate) matchStage.date.$gte = new Date(filter.startDate);
    if (filter.endDate) matchStage.date.$lte = new Date(filter.endDate);
  }

  const [statusStats, sourceStats, totalCount, recentCount] = await Promise.all([
    Lead.aggregate([
      { $match: matchStage },
      { $group: { _id: '$leadStatus', count: { $sum: 1 } } }
    ]),
    Lead.aggregate([
      { $match: matchStage },
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]),
    Lead.countDocuments({}),
    Lead.countDocuments({
      ...matchStage,
      date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    })
  ]);

  return {
    byStatus: statusStats.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
    bySource: sourceStats.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
    total: totalCount,
    last7Days: recentCount
  };
}

module.exports = {
  createLead,
  getLeads,
  updateLead,
  getLeadStats
};