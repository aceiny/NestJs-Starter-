import type { ApiSuccessResponse, ApiErrorResponse } from '../interfaces/api-response.interface';

/**
 * Build a standardized success response envelope.
 */
export function successResponse<T>(
  data: T,
  meta?: Record<string, unknown>,
): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    ...(meta && { meta }),
  };
}

/**
 * Build a standardized error response envelope.
 */
export function errorResponse(
  statusCode: number,
  message: string,
  path: string,
  errors?: Record<string, string[]> | string[],
): ApiErrorResponse {
  return {
    success: false,
    error: {
      statusCode,
      message,
      ...(errors && { errors }),
      timestamp: new Date().toISOString(),
      path,
    },
  };
}
