class ErrorResponse extends Error {
  /**
   * Create custom error response
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {object} details - Additional error details
   */
  constructor(message, statusCode, details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true; // Distinguish operational errors from programming errors

    // Capture stack trace (excluding constructor call from the trace)
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Create a Bad Request (400) error
   * @param {string} message - Error message
   * @param {object} details - Additional error details
   * @returns {ErrorResponse}
   */
  static badRequest(message = 'Bad Request', details = {}) {
    return new ErrorResponse(message, 400, details);
  }

  /**
   * Create an Unauthorized (401) error
   * @param {string} message - Error message
   * @param {object} details - Additional error details
   * @returns {ErrorResponse}
   */
  static unauthorized(message = 'Unauthorized', details = {}) {
    return new ErrorResponse(message, 401, details);
  }

  /**
   * Create a Forbidden (403) error
   * @param {string} message - Error message
   * @param {object} details - Additional error details
   * @returns {ErrorResponse}
   */
  static forbidden(message = 'Forbidden', details = {}) {
    return new ErrorResponse(message, 403, details);
  }

  /**
   * Create a Not Found (404) error
   * @param {string} message - Error message
   * @param {object} details - Additional error details
   * @returns {ErrorResponse}
   */
  static notFound(message = 'Resource Not Found', details = {}) {
    return new ErrorResponse(message, 404, details);
  }

  /**
   * Create a Conflict (409) error
   * @param {string} message - Error message
   * @param {object} details - Additional error details
   * @returns {ErrorResponse}
   */
  static conflict(message = 'Conflict', details = {}) {
    return new ErrorResponse(message, 409, details);
  }

  /**
   * Create a Validation Error (422)
   * @param {string} message - Error message
   * @param {object} errors - Validation errors
   * @returns {ErrorResponse}
   */
  static validationError(message = 'Validation Failed', errors = {}) {
    return new ErrorResponse(message, 422, { errors });
  }

  /**
   * Format error for HTTP response
   * @param {boolean} includeStackTrace - Include stack trace in response (development only)
   * @returns {object} - Formatted error response
   */
  toJSON(includeStackTrace = false) {
    const response = {
      success: false,
      error: this.message,
      statusCode: this.statusCode,
      ...this.details
    };

    if (includeStackTrace && process.env.NODE_ENV === 'development') {
      response.stack = this.stack;
    }

    return response;
  }

  /**
   * Send error response to client
   * @param {Response} res - Express response object
   */
  send(res) {
    const isDevelopment = process.env.NODE_ENV === 'development';
    res.status(this.statusCode).json(this.toJSON(isDevelopment));
  }
}

module.exports = ErrorResponse;