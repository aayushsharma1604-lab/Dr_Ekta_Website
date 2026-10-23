/**
 * Location model - Clinic location for multi-location support
 */
const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: 20,
    match: /^[A-Z0-9-]+$/
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
    country: { type: String, trim: true, default: 'India' }
  },
  phones: [{
    type: String,
    trim: true,
    match: /^[\d\s\-\+\(\)]{10,20}$/
  }],
  timings: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    open: { type: String, match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ },
    close: { type: String, match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ },
    isClosed: { type: Boolean, default: false }
  }],
  mapCoordinates: {
    latitude: { type: Number, min: -90, max: 90 },
    longitude: { type: Number, min: -180, max: 180 }
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Location', locationSchema);