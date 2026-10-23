/**
 * Lead model - CRM-ready lead database
 * Captures name, phone, treatment interest, source, status, appointment status
 */
const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  treatmentInterest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Treatment',
    default: null
  },
  source: {
    type: String,
    required: true,
    enum: ['enquiry_form', 'practo_click', 'phone_click'],
    index: true
  },
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    default: null,
    index: true
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  leadStatus: {
    type: String,
    enum: ['new', 'contacted', 'scheduled', 'completed', 'lost'],
    default: 'new',
    index: true
  },
  appointmentStatus: {
    type: String,
    enum: ['none', 'booked', 'completed', 'cancelled', 'no_show'],
    default: 'none'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  }
}, {
  timestamps: true
});

// Compound indexes for funnel reporting
leadSchema.index({ source: 1, date: -1 });
leadSchema.index({ leadStatus: 1, date: -1 });
leadSchema.index({ phone: 1, date: -1 });

/**
 * Get leads with filtering and pagination
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated results
 */
leadSchema.statics.getLeads = async function(options = {}) {
  const { 
    page = 1, 
    limit = 20, 
    status, 
    source, 
    startDate, 
    endDate,
    search 
  } = options;
  
  const query = {};
  
  if (status) query.leadStatus = status;
  if (source) query.source = source;
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }
  
  if (search && (typeof search !== 'object' || Object.keys(search).length > 0)) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }
  
  const [items, total] = await Promise.all([
    this.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('treatmentInterest', 'title slug'),
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
 * Update lead status
 * @param {ObjectId} id - Lead ID
 * @param {Object} data - Update data
 * @returns {Promise<Lead>}
 */
leadSchema.statics.updateLead = async function(id, data) {
  const allowedFields = ['leadStatus', 'appointmentStatus', 'notes', 'treatmentInterest'];
  const updateData = {};
  
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  }
  
  return this.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

/**
 * Build the export filter shared by array and cursor exports
 * @param {Object} filter - Filter criteria
 * @returns {Object} Mongoose query
 */
function buildExportQuery(filter = {}) {
  const query = {};

  if (filter.status) query.leadStatus = filter.status;
  if (filter.source) query.source = filter.source;
  if (filter.startDate || filter.endDate) {
    query.date = {};
    if (filter.startDate) query.date.$gte = new Date(filter.startDate);
    if (filter.endDate) query.date.$lte = new Date(filter.endDate);
  }

  return query;
}

/**
 * Open a cursor for streaming CSV export (F11: never loads the collection into memory)
 * @param {Object} filter - Filter criteria
 * @returns {QueryCursor} Mongoose cursor yielding lean lead docs
 */
leadSchema.statics.exportCursor = function(filter = {}) {
  const query = buildExportQuery(filter);

  return this.find(query)
    .sort({ date: -1 })
    .populate('treatmentInterest', 'title')
    .lean()
    .cursor();
};

module.exports = mongoose.model('Lead', leadSchema);