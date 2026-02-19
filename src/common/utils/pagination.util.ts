import {
    DEFAULT_LIMIT,
    MAX_PAGE_SIZE,
    MIN_PAGE,
} from '../constants/app.constant';
import type {
    PaginatedResponse,
    PaginationMeta,
    PaginationOptions,
    PaginateCallback,
    PaginateOptions,
} from '../interfaces/pagination.interface';

/**
 * Normalize pagination options with safe defaults and bounds.
 */
export function normalizePaginationOptions(
  options: PaginationOptions,
): Required<PaginationOptions> {
  const page = Math.max(options.page ?? MIN_PAGE, MIN_PAGE);
  const limit = Math.min(
    Math.max(options.limit ?? DEFAULT_LIMIT, 1),
    MAX_PAGE_SIZE,
  );
  return { page, limit };
}

/**
 * Build pagination metadata from item count, current items, and options.
 */
export function buildPaginationMeta(
  total: number,
  count: number,
  skip: number,
  options: Required<PaginationOptions>,
): PaginationMeta {
  const totalPages = Math.max(Math.ceil(total / options.limit), 1);
  const firstItem = total > 0 ? skip + 1 : 0;
  const lastItem = total > 0 ? skip + count : 0;

  return {
    total,
    count,
    page: options.page,
    limit: options.limit,
    totalPages,
    firstItem,
    lastItem,
    nextPage: options.page < totalPages ? options.page + 1 : null,
    previousPage: options.page > 1 ? options.page - 1 : null,
    hasNextPage: options.page < totalPages,
    hasPreviousPage: options.page > 1,
  };
}

/**
 * Generic paginate helper using a callback-based data fetching approach.
 *
 * The callback receives `(skip, take)` and must return `[items, totalCount]`.
 * This keeps pagination decoupled from any specific ORM or data source.
 *
 * @param options - Pagination, page/limit, and optional transform
 * @param callback - Async function that fetches a page of data
 *
 * @example
 * ```ts
 * const result = await paginate(
 *   { page: 1, limit: 20, transform: (item) => new UserDto(item) },
 *   (skip, take) => userRepo.findAndCount({ skip, take }),
 * );
 * ```
 */
export async function paginate<T>(
  options: PaginateOptions<T>,
  callback: PaginateCallback<T>,
): Promise<PaginatedResponse<T>> {
  const normalized = normalizePaginationOptions(options);
  const skip = (normalized.page - 1) * normalized.limit;

  const [items, total] = await callback(skip, normalized.limit);

  const transformedData = options.transform
    ? items.map(options.transform) as T[]
    : items;

  const meta = buildPaginationMeta(total, items.length, skip, normalized);

  return { data: transformedData, meta };
}
