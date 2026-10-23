/**
 * Announcement model - Clinic notices and announcements
 * Simple draft/published visibility (single-admin model): only published items are public
 */
const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  body: {
    type: String,
    required: true,
    trim: true
  },
  linkUrl: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
    index: true
  },
  order: {
    type: Number,
    default: 0,
    index: true
  },
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    default: null,
    index: true
  },
  publishedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Published + ordered reads for the public banner/notice list
announcementSchema.index({ status: 1, order: 1, createdAt: -1 });

/**
 * Get published announcements for public API (ordered, lean)
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated results
 */
announcementSchema.statics.getPublished = async function(options = {}) {
  const { page = 1, limit = 20 } = options;
  const query = { status: 'published' };

  const [items, total] = await Promise.all([
    this.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean(),
    this.countDocuments(query)
  ]);

  return {
    items,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get all announcements for admin (all statuses)
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated results
 */
announcementSchema.statics.getAllForAdmin = async function(options = {}) {
  const { page = 1, limit = 20, status } = options;
  const query = {};

  if (status) query.status = status;

  const [items, total] = await Promise.all([
    this.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean(),
    this.countDocuments(query)
  ]);

  return {
    items,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Set publishedAt when content transitions to published (single-admin draft/published model)
 * @param {Object} doc - Announcement document (mutated)
 */
announcementSchema.statics.stampPublishedAt = function(doc) {
  if (doc.status === 'published' && !doc.publishedAt) {
    doc.publishedAt = new Date();
  }
};

module.exports = mongoose.model('Announcement', announcementSchema);
