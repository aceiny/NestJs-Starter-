export interface PaginationMeta {
  /** Total number of items */
  total: number;
  /** Number of items in current page */
  count: number;
  /** Current page number */
  page: number;
  /** Items per page */
  limit: number;
  /** Total number of pages */
  totalPages: number;
  /** Index of first item on current page (1-based), 0 if empty */
  firstItem: number;
  /** Index of last item on current page (1-based), 0 if empty */
  lastItem: number;
  /** Next page number, or null */
  nextPage: number | null;
  /** Previous page number, or null */
  previousPage: number | null;
  /** Whether there is a next page */
  hasNextPage: boolean;
  /** Whether there is a previous page */
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

/** Callback that receives skip & take and returns [items, totalCount] */
export type PaginateCallback<T> = (
  skip: number,
  take: number,
) => Promise<[T[], number]>;

export interface PaginateOptions<T = unknown> extends PaginationOptions {
  /** Optional transform applied to each item before returning */
  transform?: (item: T) => unknown;
}
