/**
 * GalleryItem model - Smile gallery before/after pairs
 * Single-admin draft/published model (R1+R3): no consent gate, no review workflow
 */
const mongoose = require('mongoose');

const galleryItemSchema = new mongoose.Schema({
  beforeImg: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MediaAsset',
    required: true
  },
  afterImg: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MediaAsset',
    required: true
  },
  treatmentTag: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Treatment'
  },
  content: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
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

// Indexes
galleryItemSchema.index({ treatmentTag: 1, status: 1 });
galleryItemSchema.index({ status: 1, createdAt: -1 });

/**
 * Get published gallery items for public API
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated results
 */
galleryItemSchema.statics.getPublished = async function(options = {}) {
  const { page = 1, limit = 20, treatmentTag } = options;
  const query = { status: 'published' };
  
  if (treatmentTag) query.treatmentTag = treatmentTag;
  
  const [items, total] = await Promise.all([
    this.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('beforeImg afterImg')
      .populate('treatmentTag', 'title slug')
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
 * Get all gallery items for admin (all statuses)
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated results
 */
galleryItemSchema.statics.getAllForAdmin = async function(options = {}) {
  const { page = 1, limit = 20, status, treatmentTag } = options;
  const query = {};
  
  if (status) query.status = status;
  if (treatmentTag) query.treatmentTag = treatmentTag;
  
  const [items, total] = await Promise.all([
    this.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('beforeImg afterImg')
      .populate('treatmentTag', 'title slug'),
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
 * Set publishedAt when content transitions to published (single-admin draft/published model - R3)
 * @param {Object} doc - GalleryItem document (mutated)
 */
galleryItemSchema.statics.stampPublishedAt = function(doc) {
  if (doc.status === 'published' && !doc.publishedAt) {
    doc.publishedAt = new Date();
  }
};

module.exports = mongoose.model('GalleryItem', galleryItemSchema);