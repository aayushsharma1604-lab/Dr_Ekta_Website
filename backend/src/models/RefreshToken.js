/**
 * RefreshToken model - Revocable refresh tokens for JWT authentication
 * Tokens are hashed before storage, indexed for fast lookup
 */
const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  tokenHash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  device: {
    type: String,
    default: ''
  },
  ip: {
    type: String,
    default: ''
  },
  revoked: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// TTL index to auto-expire old tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/**
 * Check if token is valid (not expired, not revoked)
 * @returns {boolean}
 */
refreshTokenSchema.methods.isValid = function() {
  return !this.revoked && this.expiresAt > new Date();
};

/**
 * Revoke this token
 */
refreshTokenSchema.methods.revoke = function() {
  this.revoked = true;
  return this.save();
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);