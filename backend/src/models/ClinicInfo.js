/**
 * ClinicInfo model - Singleton for practice NAP/contact data
 * Used across all public pages, cached with explicit invalidation
 */
const mongoose = require('mongoose');

const timingSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: true
  },
  open: {
    type: String,
    required: true,
    match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  close: {
    type: String,
    required: true,
    match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  isClosed: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const socialLinkSchema = new mongoose.Schema({
  platform: {
    type: String,
    enum: ['instagram', 'youtube', 'facebook', 'linkedin', 'twitter'],
    required: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: false });

const clinicInfoSchema = new mongoose.Schema({
  // Singleton identifier - ensures only one document exists
  singleton: {
    type: String,
    default: 'clinic_info',
    unique: true
  },
  practiceName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  address: {
    street: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    pincode: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, default: 'India' }
  },
  phones: [{
    type: String,
    trim: true,
    match: /^[\d\s\-\+\(\)]{10,20}$/
  }],
  timings: [timingSchema],
  mapCoordinates: {
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 }
  },
  socialLinks: [socialLinkSchema],
  legalEntityName: {
    type: String,
    trim: true,
    default: ''
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    default: ''
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

/**
 * Get the singleton instance (creates if not exists)
 * @returns {Promise<ClinicInfo>}
 */
clinicInfoSchema.statics.getInstance = async function() {
  let clinic = await this.findOne({ singleton: 'clinic_info' });
  if (!clinic) {
    clinic = await this.create({ 
      singleton: 'clinic_info',
      practiceName: 'Dr. Ekta Narula Dental Care',
      address: { country: 'India' }
    });
  }
  return clinic;
};

/**
 * Update the clinic singleton (single admin - no audit trail by owner decision R2)
 * @param {Object} data - Update data (already allowlisted by caller)
 * @returns {Promise<ClinicInfo>}
 */
clinicInfoSchema.statics.updateSingleton = async function(data) {
  const clinic = await this.getInstance();

  Object.assign(clinic, data);
  await clinic.save();

  return clinic;
};

module.exports = mongoose.model('ClinicInfo', clinicInfoSchema);