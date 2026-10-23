/**
 * BookingProviderConfig model - Singleton for booking provider configuration
 */
const mongoose = require('mongoose');

const bookingProviderConfigSchema = new mongoose.Schema({
  // Singleton identifier
  singleton: {
    type: String,
    default: 'booking_provider',
    unique: true
  },
  providerName: {
    type: String,
    default: 'practo',
    enum: ['practo']
  },
  profileUrl: {
    type: String,
    trim: true,
    default: ''
  },
  bookingUrl: {
    type: String,
    trim: true,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

/**
 * Get or create the singleton instance
 * @returns {Promise<BookingProviderConfig>}
 */
bookingProviderConfigSchema.statics.getActive = async function() {
  return this.findOne({ singleton: 'booking_provider', isActive: true });
};

/**
 * Get or create the singleton instance (for admin)
 * @returns {Promise<BookingProviderConfig>}
 */
bookingProviderConfigSchema.statics.getOrCreate = async function() {
  let config = await this.findOne({ singleton: 'booking_provider' });
  if (!config) {
    config = await this.create({ singleton: 'booking_provider' });
  }
  return config;
};

module.exports = mongoose.model('BookingProviderConfig', bookingProviderConfigSchema);