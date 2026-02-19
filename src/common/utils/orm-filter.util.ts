import { isUUID } from "class-validator";
import {
  Between,
  Equal,
  FindOptionsWhere,
  ILike,
  IsNull,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
} from "typeorm";

/**
 * Handles range filtering for any numeric or date field.
 *
 * @param exactValue - the exact match (e.g., `filter.reward`)
 * @param minValue - the minimum bound (e.g., `filter.min_reward`)
 * @param maxValue - the maximum bound (e.g., `filter.max_reward`)
 */
export function buildRangeFilter<T>(
  exactValue?: T,
  minValue?: T,
  maxValue?: T,
  options: { inclusive?: boolean } = {},
) {
  const { inclusive = true } = options;

  if (exactValue !== undefined) {
    return exactValue;
  }

  if (minValue !== undefined && maxValue !== undefined) {
    return inclusive
      ? Between(minValue, maxValue)
      : Between(minValue, maxValue);
  }

  if (minValue !== undefined) {
    return inclusive ? MoreThanOrEqual(minValue) : MoreThan(minValue);
  }

  if (maxValue !== undefined) {
    return inclusive ? LessThanOrEqual(maxValue) : LessThan(maxValue);
  }

  return undefined;
}

/**
 * Builds an ILike filter if a value is provided.
 *
 * @param value - the string value to search for
 * @returns an ILike expression or undefined
 */
export function buildILikeFilter(value?: string) {
  if (value !== undefined && value !== null && value.trim() !== "") {
    return ILike(`%${value}%`);
  }
  return undefined;
}

export function buildEqualityFilter<T>(value?: T) {
  if (value !== undefined && value !== null) {
    return Equal(value);
  }
  return undefined;
}
export function buildRelationFilter(
  value?: string | null,
  options?: { allowNull?: boolean },
): FindOptionsWhere<Record<string, unknown>> | undefined {
  if (value !== undefined && value !== null && isUUID(value, '4')) {
    return { id: Equal(value) };
  }
  if (value === null && options?.allowNull) {
    return { id: IsNull() };
  }
  return undefined;
}
export function buildRelationFieldFilter(
  field: string,
  value?: string,
): FindOptionsWhere<Record<string, unknown>> | undefined {
  if (value !== undefined && value !== null && isUUID(value, '4')) {
    return { [field]: Equal(value) };
  }
  return undefined;
}
export function buildRelationFieldILikeFilter(
  field: string,
  value?: string,
): FindOptionsWhere<Record<string, unknown>> | undefined {
  if (value !== undefined && value !== null && value.trim() !== '') {
    return { [field]: ILike(`%${value}%`) };
  }
  return undefined;
}
/**
 * Builds an Like filter if a value is provided.
 *
 * @param value - the string value to search for
 * @returns an Like expression or undefined
 */
export function buildLikeFilter(value?: string) {
  if (value !== undefined && value !== null && value.trim() !== "") {
    return Like(`%${value}%`);
  }
  return undefined;
}

export function buildEnumFilter<T extends Record<string, string | number>>(
  enumObj: T,
  value?: unknown,
): T[keyof T] | undefined {
  const enumValues = Object.values(enumObj);
  if (
    value !== undefined &&
    value !== null &&
    value !== "" &&
    enumValues.includes(value as any)
  ) {
    return value as T[keyof T];
  }
  return undefined;
}

/**
 * Builds an OR-condition array for searching multiple fields.
 *
 * @param search - the search string
 * @param fields - the entity fields to search
 * @returns an array of where conditions (to be used in TypeORM `where`)
 */
export function buildSearchFilter<T>(
  search: string | undefined,
  fields: (keyof T)[],
): FindOptionsWhere<T>[] | undefined {
  if (!search || search.trim() === "") {
    return undefined;
  }

  const parts = search.trim().split(/\s+/);

  // If only one part, just do as before.
  if (parts.length === 1) {
    const pattern = `%${parts[0]}%`;
    return fields.map((field) => ({
      [field]: ILike(pattern),
    })) as FindOptionsWhere<T>[];
  }

  // For multi-part (e.g., full name), try all field combinations
  const filters: FindOptionsWhere<T>[] = [];

  // If parts.length matches fields.length, map each part to a field.
  if (parts.length === fields.length) {
    // Each part in its corresponding field
    const filter: FindOptionsWhere<T> = {};
    for (let i = 0; i < fields.length; i++) {
      filter[fields[i]] = ILike(`%${parts[i]}%`) as any;
    }
    filters.push(filter);
  }

  // Also allow each part to match any field
  parts.forEach((part) => {
    const pattern = `%${part}%`;
    fields.forEach((field) => {
      filters.push({ [field]: ILike(pattern) } as FindOptionsWhere<T>);
    });
  });

  return filters;
}

export function mergeSearchConditions<T>(
  andFilters: FindOptionsWhere<T>,
  searchConditions: FindOptionsWhere<T>[] | undefined,
): FindOptionsWhere<T> | FindOptionsWhere<T>[] {
  if (!searchConditions || searchConditions.length === 0) {
    return andFilters;
  }
  return searchConditions.map((searchCond) => ({
    ...andFilters,
    ...searchCond,
  }));
}