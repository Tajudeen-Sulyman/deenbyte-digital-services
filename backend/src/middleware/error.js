const logger = require('../config/logger');
const { ApiError } = require('../utils/response');

function notFoundHandler(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

function errorHandler(err, req, res, next) {
  let { statusCode, message, details } = err;

  if (!statusCode) statusCode = 500;
  if (!message) message = 'Internal server error';

  if (err.code === 'P2002') {
    statusCode = 409;
    message = `Duplicate value for field: ${err.meta?.target?.join(', ') || 'unknown'}`;
  }
  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Requested record was not found';
  }

  if (statusCode >= 500) {
    logger.error(err.message, { stack: err.stack, path: req.originalUrl });
  } else {
    logger.warn(`${statusCode} - ${message} - ${req.method} ${req.originalUrl}`);
  }

  const payload = { success: false, message };
  if (details) payload.details = details;
  if (process.env.NODE_ENV === 'development' && statusCode >= 500) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
}

module.exports = { notFoundHandler, errorHandler };
