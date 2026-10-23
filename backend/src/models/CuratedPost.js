/**
 * CuratedPost model - Instagram posts
 * Plain CRUD, no live Instagram API dependency
 */
const mongoose = require('mongoose');

const curatedPostSchema = new mongoose.Schema({
  image: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MediaAsset',
    required: true
  },
  caption: {
    type: String,
    trim: true
  },
  permalink: {
    type: String,
    required: true,
    trim: true
  },
  order: {
    type: Number,
    default: 0
  },
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    default: null,
    index: true
  }
}, {
  timestamps: true
});

// Indexes
curatedPostSchema.index({ order: 1 });

/**
 * Get curated posts for public API
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated results
 */
curatedPostSchema.statics.getPublished = async function(options = {}) {
  const { page = 1, limit = 20 } = options;
  
  const [items, total] = await Promise.all([
    this.find()
      .sort({ order: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('image')
      .lean(),
    this.countDocuments()
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
 * Get all curated posts for admin
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated results
 */
curatedPostSchema.statics.getAllForAdmin = async function(options = {}) {
  const { page = 1, limit = 20 } = options;
  
  const [items, total] = await Promise.all([
    this.find()
      .sort({ order: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('image'),
    this.countDocuments()
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

module.exports = mongoose.model('CuratedPost', curatedPostSchema);