import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { PaginationOptions } from '../interfaces/pagination.interface';
import { normalizePaginationOptions } from '../utils/pagination.util';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '../constants/app.constant';

/**
 * Extract and normalize pagination options from query parameters.
 *
 * @example
 * @Get()
 * findAll(@Pagination() pagination: Required<PaginationOptions>) {}
 */
export const Pagination = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Required<PaginationOptions> => {
    const request = ctx.switchToHttp().getRequest();
    const page = parseInt(request.query.page as string, 10) || DEFAULT_PAGE;
    const limit = parseInt(request.query.limit as string, 10) || DEFAULT_LIMIT;
    return normalizePaginationOptions({ page, limit });
  },
);
