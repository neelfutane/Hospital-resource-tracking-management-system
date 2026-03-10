class ApiResponse {
  static success(data, message = 'Success', statusCode = 200) {
    return {
      success: true,
      message,
      data,
      statusCode,
    };
  }

  static error(message = 'Internal Server Error', statusCode = 500, errors = null) {
    return {
      success: false,
      message,
      errors,
      statusCode,
    };
  }

  static created(data, message = 'Created successfully') {
    return this.success(data, message, 201);
  }

  static notFound(message = 'Resource not found') {
    return this.error(message, 404);
  }

  static badRequest(message = 'Bad request', errors = null) {
    return this.error(message, 400, errors);
  }

  static unauthorized(message = 'Unauthorized') {
    return this.error(message, 401);
  }

  static forbidden(message = 'Forbidden') {
    return this.error(message, 403);
  }

  static conflict(message = 'Conflict') {
    return this.error(message, 409);
  }
}

module.exports = ApiResponse;
