/**
 * Express application setup
 * Configures middleware, routes, error handling
 */
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./config/db');
const env = require('./config/env');
const User = require('./models/User');

// Validate environment at startup
env.validateEnv();
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler.middleware');
const { sanitizeBodyKeys } = require('./middlewares/validate.middleware');
const { logger } = require('./utils/logger');
const adminRoutes = require('./routes/admin.routes');
const publicRoutes = require('./routes/public.routes');
const contentRoutes = require('./routes/content.routes');
const publicContentRoutes = require('./routes/public-content.routes');
const enquiryRoutes = require('./routes/enquiry.routes');
const leadRoutes = require('./routes/lead.routes');
const practoRoutes = require('./routes/practo.routes');
const { publicRouter: publicProfileRoutes, adminRouter: adminProfileRoutes } = require('./routes/profile.routes');
const { publicRouter: publicTestimonialRoutes, adminRouter: adminTestimonialRoutes } = require('./routes/testimonial.routes');
const { publicRouter: publicGalleryRoutes, adminRouter: adminGalleryRoutes } = require('./routes/gallery.routes');
const { publicRouter: publicVideoRoutes, adminRouter: adminVideoRoutes } = require('./routes/video.routes');
const { publicRouter: publicCuratedPostRoutes, adminRouter: adminCuratedPostRoutes } = require('./routes/curatedPost.routes');
const { publicRouter: publicAnnouncementRoutes, adminRouter: adminAnnouncementRoutes } = require('./routes/announcement.routes');
const homepageRoutes = require('./routes/homepage.routes');
const seoRoutes = require('./routes/seo.routes');
const redirectRoutes = require('./routes/redirect.routes');
const analyticsRoutes = require('./routes/analytics.routes');

const app = express();

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Configure as needed for frontend
  crossOriginEmbedderPolicy: false
}));

// CORS (allowlist from FRONTEND_URL, comma-separated - F31)
app.use(cors({
  origin: env.frontendOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing (1mb cap fits CMS article bodies - F25)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Compression
app.use(compression());

// NoSQL injection prevention
app.use(mongoSanitize());

// Sanitize request keys
app.use(sanitizeBodyKeys);

// Cache control for public endpoints
app.use('/api/public', (req, res, next) => {
  // ClinicInfo - long TTL (1 hour)
  if (req.path === '/profile' || req.path.startsWith('/profile')) {
    res.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
  }
  // Treatments/Articles/Videos/Team - medium TTL (5 min)
  else if (req.path.startsWith('/treatments') || req.path.startsWith('/articles') || req.path.startsWith('/videos') || req.path.startsWith('/team')) {
    res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
  }
  // Homepage - short TTL (1 min)
  else if (req.path === '/home') {
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
  }
  // Sitemap/Robots - long TTL (1 hour)
  else if (req.path === '/sitemap.xml' || req.path === '/robots.txt') {
    res.set('Cache-Control', 'public, max-age=3600');
  }
  // Other public endpoints - no cache
  else {
    res.set('Cache-Control', 'no-store');
  }
  next();
});

// Admin endpoints - no cache
app.use('/api/admin', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  });
  next();
});

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/admin', contentRoutes);
app.use('/api/admin/leads', leadRoutes);
app.use('/api/admin', practoRoutes);
app.use('/api/admin/profile', adminProfileRoutes);
app.use('/api/admin/testimonials', adminTestimonialRoutes);
app.use('/api/admin/gallery', adminGalleryRoutes);
app.use('/api/admin/videos', adminVideoRoutes);
app.use('/api/admin/instagram-posts', adminCuratedPostRoutes);
app.use('/api/admin/announcements', adminAnnouncementRoutes);
app.use('/api/admin/home', homepageRoutes);
app.use('/api/admin/redirects', redirectRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/api/public/profile', publicProfileRoutes);
app.use('/api/public/testimonials', publicTestimonialRoutes);
app.use('/api/public/gallery', publicGalleryRoutes);
app.use('/api/public/videos', publicVideoRoutes);
app.use('/api/public/instagram-posts', publicCuratedPostRoutes);
app.use('/api/public/announcements', publicAnnouncementRoutes);
app.use('/api/public/home', homepageRoutes);
app.use('/api/public', seoRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/public', publicContentRoutes);
app.use('/api/public', enquiryRoutes);
app.use('/api/public', practoRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Dr. Ekta Narula Dental Care API',
    version: '1.0.0',
    status: 'running'
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

/**
 * Seed default admin user if not exists
 */
async function seedDefaultAdmin() {
  const defaultEmail = 'admin@gmail.com';
  const defaultPassword = 'admin123';

  try {
    const existingUser = await User.findOne({ email: defaultEmail });
    if (!existingUser) {
      await User.create({
        name: 'Admin',
        email: defaultEmail,
        passwordHash: defaultPassword // pre-save hook will hash this
      });
      logger.info(`Default admin user created: ${defaultEmail}`);
    } else {
      logger.info(`Default admin user already exists: ${defaultEmail}`);
    }
  } catch (err) {
    logger.warn('Failed to seed default admin user', { error: err.message });
  }
}

/**
 * Start the server
 * @returns {Promise<http.Server>}
 */
async function startServer() {
  await connectDB();
  await seedDefaultAdmin();

  const server = app.listen(env.port, () => {
    logger.info(`Server running on port ${env.port} in ${env.nodeEnv} mode`);
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    logger.info(`${signal} received, shutting down gracefully`);
    server.close(async () => {
      const { disconnectDB } = require('./config/db');
      await disconnectDB();
      process.exit(0);
    });
    
    // Force close after 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  return server;
}

// Start if not in test mode
if (require.main === module && process.env.NODE_ENV !== 'test') {
  startServer().catch(err => {
    logger.error('Failed to start server', { error: err.message, stack: err.stack });
    process.exit(1);
  });
}

module.exports = { app, startServer };