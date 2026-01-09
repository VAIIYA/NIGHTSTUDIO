// Standard API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: number;
    requestId?: string;
  };
}

// Error codes for consistent error handling
export enum ErrorCode {
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',

  // Authentication/Authorization errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',

  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',

  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Server errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',

  // Business logic errors
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  CONTENT_BLOCKED = 'CONTENT_BLOCKED',
  ACCOUNT_SUSPENDED = 'ACCOUNT_SUSPENDED',
}

// Create standardized success response
export function createSuccessResponse<T>(
  data: T,
  meta?: Partial<ApiResponse['meta']>
): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: Date.now(),
      ...meta,
    },
  };
}

// Create standardized error response
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  details?: any,
  statusCode: number = 400
): { response: ApiResponse; statusCode: number } {
  const errorResponse: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
    meta: {
      timestamp: Date.now(),
    },
  };

  return {
    response: errorResponse,
    statusCode,
  };
}

// Common error responses
export const ErrorResponses = {
  validationError: (message: string, details?: any) =>
    createErrorResponse(ErrorCode.VALIDATION_ERROR, message, details, 400),

  notFound: (resource: string) =>
    createErrorResponse(ErrorCode.NOT_FOUND, `${resource} not found`, undefined, 404),

  unauthorized: (message: string = 'Authentication required') =>
    createErrorResponse(ErrorCode.UNAUTHORIZED, message, undefined, 401),

  forbidden: (message: string = 'Access denied') =>
    createErrorResponse(ErrorCode.FORBIDDEN, message, undefined, 403),

  rateLimited: (retryAfter: number) =>
    createErrorResponse(
      ErrorCode.RATE_LIMIT_EXCEEDED,
      'Too many requests',
      { retryAfter },
      429
    ),

  internalError: (message: string = 'Internal server error') =>
    createErrorResponse(ErrorCode.INTERNAL_ERROR, message, undefined, 500),

  databaseError: () =>
    createErrorResponse(ErrorCode.DATABASE_ERROR, 'Database operation failed', undefined, 500),
};

// Helper to handle async operations with error handling
export async function withErrorHandler<T>(
  operation: () => Promise<T>,
  errorMessage: string = 'Operation failed'
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    console.error(`${errorMessage}:`, error);

    // Re-throw validation errors
    if (error.message?.includes('Validation failed')) {
      throw error;
    }

    // Re-throw custom API errors
    if (error.response) {
      throw error;
    }

    // Wrap other errors
    throw new Error(errorMessage);
  }
}