/**
 * Convert an enum to an array of { key, value } objects.
 */
export function enumToArray<T extends Record<string, string | number>>(
  enumObj: T,
): { key: string; value: T[keyof T] }[] {
  return enumKeys(enumObj).map((key) => ({
    key,
    value: enumObj[key] as T[keyof T],
  }));
}

/**
 * Get all values of an enum.
 * Filters out reverse-mapped numeric keys automatically.
 */
export function enumValues<T extends Record<string, string | number>>(
  enumObj: T,
): T[keyof T][] {
  return enumKeys(enumObj).map((key) => enumObj[key] as T[keyof T]);
}

/**
 * Get all keys of an enum.
 * Filters out reverse-mapped numeric keys for numeric enums.
 */
export function enumKeys<T extends Record<string, string | number>>(
  enumObj: T,
): string[] {
  return Object.keys(enumObj).filter((key) => isNaN(Number(key)));
}

/**
 * Check if a value is a valid member of a given enum.
 */
export function isValidEnumValue<T extends Record<string, string | number>>(
  enumObj: T,
  value: unknown,
): value is T[keyof T] {
  return enumValues(enumObj).includes(value as T[keyof T]);
}

/**
 * Normalizes an enum key string by:
 * 1. Replacing underscores (_) and hyphens (-) with spaces.
 * 2. Collapsing multiple consecutive spaces into a single space.
 * 3. Trimming leading and trailing spaces.
 * 4. Capitalizing the first letter of each word.
 *
 * @param {string} key - The enum key to normalize.
 * @returns {string} The normalized, human-readable string.
 *
 * @example
 * normalizeEnumKey('MY_ENUM_KEY'); // returns 'My Enum Key'
 * normalizeEnumKey('another-enum-key'); // returns 'Another Enum Key'
 */
export function normalizeEnumKey(key: string): string {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
