import { logger } from './logger';
import { getUserFriendlyError, type UserFacingError } from './error';

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  public code: string;
  public statusCode: number;
  public context?: Record<string, any>;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Network error class
 */
export class NetworkError extends AppError {
  constructor(message: string = 'Network error occurred', context?: Record<string, any>) {
    super(message, 'NETWORK_ERROR', 0, context);
    this.name = 'NetworkError';
  }
}

/**
 * Authentication error class
 */
export class AuthError extends AppError {
  constructor(message: string = 'Authentication failed', context?: Record<string, any>) {
    super(message, 'AUTH_ERROR', 401, context);
    this.name = 'AuthError';
  }
}

/**
 * Validation error class
 */
export class ValidationError extends AppError {
  public errors?: Record<string, string[]>;

  constructor(
    message: string = 'Validation failed',
    errors?: Record<string, string[]>,
    context?: Record<string, any>
  ) {
    super(message, 'VALIDATION_ERROR', 422, context);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Not found error class
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', context?: Record<string, any>) {
    super(message, 'NOT_FOUND', 404, context);
    this.name = 'NotFoundError';
  }
}

/**
 * Forbidden error class
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden', context?: Record<string, any>) {
    super(message, 'FORBIDDEN', 403, context);
    this.name = 'ForbiddenError';
  }
}

/**
 * Handles API errors and converts them to appropriate error types
 */
export function handleApiError(error: any, context?: Record<string, any>): AppError {
  // If it's already an AppError, return it
  if (error instanceof AppError) {
    return error;
  }

  // Network errors
  if (
    error?.code === 'ERR_NETWORK' ||
    error?.message === 'Network Error' ||
    (!error?.response && error?.request)
  ) {
    logger.error('Network error', error, context);
    return new NetworkError('لا يمكن الاتصال بالخادم. تحقق من اتصالك بالإنترنت.', context);
  }

  // Timeout errors
  if (error?.code === 'ECONNABORTED' || String(error?.message || '').toLowerCase().includes('timeout')) {
    logger.error('Timeout error', error, context);
    return new NetworkError('انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى.', context);
  }

  const statusCode = error?.response?.status;
  const serverMessage = error?.response?.data?.message || error?.message;

  // Handle specific status codes
  switch (statusCode) {
    case 400:
    case 422:
      logger.error('Validation error', error, context);
      const validationErrors = error?.response?.data?.errors;
      return new ValidationError(
        serverMessage || 'البيانات المدخلة غير صحيحة',
        validationErrors,
        context
      );

    case 401:
      logger.error('Authentication error', error, context);
      return new AuthError(
        serverMessage || 'بيانات الدخول غير صحيحة',
        context
      );

    case 403:
      logger.error('Forbidden error', error, context);
      return new ForbiddenError(
        serverMessage || 'ليس لديك صلاحية للوصول إلى هذا المورد',
        context
      );

    case 404:
      logger.error('Not found error', error, context);
      return new NotFoundError(
        serverMessage || 'المورد المطلوب غير موجود',
        context
      );

    case 500:
    case 502:
    case 503:
    case 504:
      logger.error('Server error', error, context);
      return new AppError(
        serverMessage || 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً',
        'SERVER_ERROR',
        statusCode,
        context
      );

    default:
      logger.error('Unknown error', error, context);
      return new AppError(
        serverMessage || 'حدث خطأ غير متوقع',
        'UNKNOWN_ERROR',
        statusCode || 500,
        context
      );
  }
}

/**
 * Converts an error to a user-friendly error message
 */
export function toUserFriendlyError(error: any): UserFacingError {
  if (error instanceof AppError) {
    return {
      message: error.message,
      severity: error.statusCode >= 500 ? 'error' : 
                error.statusCode >= 400 ? 'warning' : 'error',
    };
  }

  return getUserFriendlyError(error);
}

/**
 * Checks if error is retryable
 */
export function isRetryableError(error: any): boolean {
  if (error instanceof NetworkError) {
    return true;
  }

  if (error instanceof AppError) {
    return error.statusCode >= 500 || error.statusCode === 0;
  }

  const statusCode = error?.response?.status;
  return statusCode >= 500 || !statusCode;
}

