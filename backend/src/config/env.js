/**
 * Environment configuration - validates and exports all env vars
 * Centralizes environment variable access with defaults and validation
 */
require('dotenv').config();

const required = [
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'MONGODB_URI'
];

/**
 * Validate required environment variables
 * Call this at application startup, not at module load
 */
function validateEnv() {
  // Skip validation in test environment
  if (process.env.NODE_ENV === 'test') {
    return;
  }
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}

const config = {
  port: parseInt(process.env.PORT, 10) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d'
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100
  },
  storage: {
    provider: 'cloudinary',
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET
    }
  },
  practo: {
    profileUrl: process.env.PRACTO_PROFILE_URL,
    bookingUrl: process.env.PRACTO_BOOKING_URL
  },
  googleAnalytics: {
    measurementId: process.env.GA_MEASUREMENT_ID,
    apiSecret: process.env.GA_API_SECRET
  },
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    notificationEmail: process.env.NOTIFICATION_EMAIL
  },
  captcha: {
    // reCAPTCHA secret; when unset, captcha is not verified server-side (dev/test fallback - F10)
    recaptchaSecret: process.env.RECAPTCHA_SECRET || ''
  },
  // Comma-separated allowlist, e.g. "https://site.com,https://admin.site.com" (F31)
  frontendOrigins: (process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
};

module.exports = { ...config, validateEnv };