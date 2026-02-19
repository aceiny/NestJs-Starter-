export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    statusCode: number;
    message: string;
    errors?: Record<string, string[]> | string[];
    timestamp: string;
    path: string;
  };
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;
