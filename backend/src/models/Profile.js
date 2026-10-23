/**
 * Profile model - About / Meet Dr. Ekta singleton
 * Simple read/write singleton — no approval workflow since Dr. Ekta is both source and reviewer
 */
const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  qualifications: [{
    degree: { type: String, trim: true, maxlength: 200 },
    institution: { type: String, trim: true, maxlength: 200 },
    year: { type: Number, min: 1950, max: 2030 }
  }],
  memberships: [{
    organization: { type: String, trim: true, maxlength: 200 },
    role: { type: String, trim: true, maxlength: 100 },
    since: { type: Number, min: 1950, max: 2030 }
  }],
  awards: [{
    title: { type: String, trim: true, maxlength: 200 },
    issuer: { type: String, trim: true, maxlength: 200 },
    year: { type: Number, min: 1950, max: 2030 }
  }],
  mediaAppearances: [{
    outlet: { type: String, trim: true, maxlength: 200 },
    title: { type: String, trim: true, maxlength: 200 },
    date: { type: Date },
    url: { type: String, trim: true }
  }],
  publications: [{
    title: { type: String, trim: true, maxlength: 300 },
    journal: { type: String, trim: true, maxlength: 200 },
    year: { type: Number, min: 1950, max: 2030 },
    url: { type: String, trim: true }
  }],
  photo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MediaAsset'
  },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MediaAsset'
  },
  bio: {
    type: String,
    trim: true
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
 * Get the singleton profile (creates if not exists)
 * @returns {Promise<Profile>}
 */
profileSchema.statics.getSingleton = async function() {
  let profile = await this.findOne().populate('photo video');
  if (!profile) {
    profile = await this.create({});
  }
  return profile;
};

/**
 * Update the singleton profile
 * @param {Object} data - Profile data to update
 * @param {ObjectId} userId - Admin user ID for audit
 * @returns {Promise<Profile>}
 */
profileSchema.statics.updateSingleton = async function(data, userId) {
  const profile = await this.getSingleton();
  
  const allowedFields = [
    'qualifications', 'memberships', 'awards',
    'mediaAppearances', 'publications', 'photo',
    'video', 'bio', 'locationId'
  ];
  
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      profile[field] = data[field];
    }
  }
  
  return profile.save();
};

module.exports = mongoose.model('Profile', profileSchema);