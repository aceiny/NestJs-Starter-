import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { ApiSuccessResponse } from '../interfaces/api-response.interface';

/**
 * Wrap all successful responses in a standardized envelope:
 * { success: true, data: ..., meta?: ... }
 */
@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, ApiSuccessResponse<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiSuccessResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data is already wrapped, return as-is
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          (data as Record<string, unknown>)['success'] !== undefined
        ) {
          return data as unknown as ApiSuccessResponse<T>;
        }

        // Extract meta if present (e.g., from paginated responses)
        let meta: Record<string, unknown> | undefined;
        if (data && typeof data === 'object' && 'meta' in data) {
          const raw = data as Record<string, unknown>;
          meta = raw['meta'] as Record<string, unknown>;
        }

        return {
          success: true as const,
          data,
          ...(meta && { meta }),
        };
      }),
    );
  }
}
