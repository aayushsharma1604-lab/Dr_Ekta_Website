/**
 * Video model - YouTube videos with accessibility fields
 * Plain CRUD, no external YouTube API dependency
 */
const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  category: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    index: true
  },
  thumbnail: {
    type: String,
    trim: true
  },
  order: {
    type: Number,
    default: 0,
    index: true
  },
  status: {
    type: String,
    enum: ['published', 'hidden'],
    default: 'published',
    index: true
  },
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    default: null,
    index: true
  },
  transcript: {
    type: String,
    trim: true
  },
  captionsUrl: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MediaAsset'
  }
}, {
  timestamps: true
});

// Indexes
videoSchema.index({ category: 1, order: 1 });
videoSchema.index({ status: 1, category: 1 });

/**
 * Get published videos for public API
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated results
 */
videoSchema.statics.getPublished = async function(options = {}) {
  const { page = 1, limit = 20, category } = options;
  const query = { status: 'published' };
  
  if (category) query.category = category;
  
  const [items, total] = await Promise.all([
    this.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('captionsUrl')
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
 * Get all videos for admin (all statuses)
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated results
 */
videoSchema.statics.getAllForAdmin = async function(options = {}) {
  const { page = 1, limit = 20, status, category } = options;
  const query = {};
  
  if (status) query.status = status;
  if (category) query.category = category;
  
  const [items, total] = await Promise.all([
    this.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('captionsUrl'),
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

module.exports = mongoose.model('Video', videoSchema);