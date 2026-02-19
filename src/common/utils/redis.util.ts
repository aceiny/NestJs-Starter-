/**
 * Build a standardized Redis key
 * Example: "user:123:profile" or "cache:articles:page:2"
 */
export const buildRedisKey = (...segments: (string | number)[]): string => {
  return segments.map(String).join(':');
};

/**
 * Serialize a value for Redis storage
 * Automatically converts objects to JSON
 */
export const serializeRedisValue = <T>(value: T): string => {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch (err) {
    throw new Error(`Redis serialization error: ${(err as Error).message}`);
  }
};

/**
 * Deserialize a Redis value
 */
export const deserializeRedisValue = <T>(value: string | null): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    // If it's not JSON, return as string
    return value as unknown as T;
  }
};
