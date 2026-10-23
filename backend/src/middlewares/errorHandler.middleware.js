/**
 * Centralized error handling middleware
 * Normalizes all errors to consistent JSON responses
 */
const { logger } = require('../utils/logger');

/**
 * Custom error classes for different error types
 */
class AppError extends Error {
  constructor(message, statusCode, code = 'ERROR', details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details) {
    super(message, 422, 'VALIDATION_ERROR', details);
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

/**
 * Handle Mongoose validation errors
 * @param {Error} err - Mongoose error
 * @returns {AppError}
 */
function handleMongooseValidationError(err) {
  const details = Object.values(err.errors).map(e => ({
    field: e.path,
    message: e.message,
    value: e.value
  }));
  return new ValidationError('Validation failed', details);
}

/**
 * Handle Mongoose duplicate key errors
 * @param {Error} err - MongoDB error
 * @returns {AppError}
 */
function handleDuplicateKeyError(err) {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  return new ValidationError(`${field} '${value}' already exists`);
}

/**
 * Handle Mongoose cast errors (invalid ObjectId)
 * @param {Error} err - Mongoose error
 * @returns {AppError}
 */
function handleCastError(err) {
  return new ValidationError(`Invalid ${err.path}: ${err.value}`);
}

/**
 * Global error handler middleware
 * @param {Error} err - Error
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Next middleware
 */
function errorHandler(err, req, res, next) {
  try {
    // Log error with request context
    console.error('ERROR HANDLER:', {
      message: err.message,
      name: err.name,
      statusCode: err.statusCode,
      code: err.code,
      isOperational: err.isOperational,
      stack: err.stack
    });
    logger.error('Request error', {
      error: err.message,
      stack: err.stack,
      method: req.method,
      path: req.path,
      ip: req.ip,
      userId: req.user?._id,
      isOperational: err.isOperational,
      statusCode: err.statusCode,
      code: err.code
    });

    // Handle known error types
    if (err.name === 'ValidationError') {
      err = handleMongooseValidationError(err);
    } else if (err.code === 11000) {
      err = handleDuplicateKeyError(err);
    } else if (err.name === 'CastError') {
      err = handleCastError(err);
    } else if (err.name === 'JsonWebTokenError') {
      err = new AuthenticationError('Invalid token');
    } else if (err.name === 'TokenExpiredError') {
      err = new AuthenticationError('Token expired');
    } else if (err.type === 'entity.too.large' || err.status === 413) {
      // body-parser PayloadTooLargeError: map to a clear operational 413
      // instead of the generic "Internal server error"
      err = new AppError(
        `Request body too large (limit ${err.limit || '1mb'}). Upload images via the Media Library instead of embedding them.`,
        413,
        'PAYLOAD_TOO_LARGE'
      );
    }

    // Default to 500 for unknown errors
    const statusCode = err.statusCode || 500;
    const code = err.code || 'INTERNAL_ERROR';
    const message = err.isOperational ? err.message : 'Internal server error';

    console.error('ERROR HANDLER RESPONSE:', { statusCode, code, message, isOperational: err.isOperational });

    // Don't leak error details in production
    const response = {
      error: message,
      code
    };

    // In test mode, include the actual error message for debugging
    if (process.env.NODE_ENV === 'test') {
      response.error = err.message;
      response.stack = err.stack;
      response.isOperational = err.isOperational;
      response.originalStatusCode = err.statusCode;
    }

    if (err.details && process.env.NODE_ENV !== 'production') {
      response.details = err.details;
    }

    console.error('SENDING RESPONSE:', { statusCode, response });
    res.status(statusCode).json(response);
  } catch (handlerError) {
    console.error('ERROR IN ERROR HANDLER:', handlerError);
    res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
}

/**
 * 404 handler for unmatched routes
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'Route not found',
    code: 'NOT_FOUND'
  });
}

/**
 * Async handler wrapper - catches async errors
 * @param {Function} fn - Async route handler
 * @returns {Function} Express middleware
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  ConflictError
};