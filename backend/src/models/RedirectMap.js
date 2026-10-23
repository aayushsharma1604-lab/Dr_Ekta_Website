/**
 * RedirectMap model - URL redirect management
 */
const mongoose = require('mongoose');

const redirectMapSchema = new mongoose.Schema({
  fromPath: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 500
  },
  toPath: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  statusCode: {
    type: Number,
    enum: [301, 302],
    default: 301
  }
}, {
  timestamps: true
});

/**
 * Get redirect for a path
 * @param {string} fromPath - Source path
 * @returns {Promise<RedirectMap|null>}
 */
redirectMapSchema.statics.findByFromPath = async function(fromPath) {
  return this.findOne({ fromPath });
};

/**
 * Get all redirects for admin
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated results
 */
redirectMapSchema.statics.getAllForAdmin = async function(options = {}) {
  const { page = 1, limit = 20, search } = options;
  const query = {};
  
  if (search) {
    query.$or = [
      { fromPath: { $regex: search, $options: 'i' } },
      { toPath: { $regex: search, $options: 'i' } }
    ];
  }
  
  const [items, total] = await Promise.all([
    this.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit)),
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

module.exports = mongoose.model('RedirectMap', redirectMapSchema);