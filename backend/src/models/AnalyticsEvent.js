/**
 * AnalyticsEvent model - Server-side analytics event backup
 * Distinct from client-side GA4/GTM events
 */
const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    enum: [
      'page_view',
      'enquiry_submit',
      'practo_click',
      'appointment_book',
      'video_play',
      'testimonial_view',
      'gallery_view',
      'article_read',
      'treatment_view'
    ],
    index: true
  },
  refId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'refModel'
  },
  refModel: {
    type: String,
    enum: ['Treatment', 'Article', 'Video', 'Testimonial', 'GalleryItem', 'Lead', 'Appointment']
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  sessionId: {
    type: String,
    trim: true
  },
  ip: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound indexes for common queries
analyticsEventSchema.index({ eventType: 1, createdAt: -1 });
analyticsEventSchema.index({ refModel: 1, refId: 1, createdAt: -1 });
analyticsEventSchema.index({ createdAt: -1 });

/**
 * Log an analytics event
 * @param {Object} data - Event data
 * @returns {Promise<AnalyticsEvent>}
 */
analyticsEventSchema.statics.logEvent = async function(data) {
  return this.create(data);
};

/**
 * Get aggregated analytics for monthly report
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
analyticsEventSchema.statics.getMonthlyReport = async function(options = {}) {
  const { startDate, endDate } = options;
  const matchStage = {};
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }
  
  const [eventTypeStats, dailyStats, topPages, leadSourceStats] = await Promise.all([
    this.aggregate([
      { $match: matchStage },
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    this.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    this.aggregate([
      { $match: { ...matchStage, refId: { $exists: true, $ne: null } } },
      { $group: { _id: '$refId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    this.aggregate([
      { $match: { ...matchStage, eventType: 'enquiry_submit' } },
      { $group: { _id: '$metadata.source', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])
  ]);
  
  return {
    byEventType: eventTypeStats.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
    dailyStats: dailyStats.map(d => ({ date: d._id, count: d.count })),
    topPages: topPages,
    leadSources: leadSourceStats.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {})
  };
};

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);