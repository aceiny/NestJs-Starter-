/**
 * Get the current date/time as a Date object.
 */
export function now(): Date {
  return new Date();
}

/**
 * Add a number of days to a date.
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Subtract a number of days from a date.
 */
export function subtractDays(date: Date, days: number): Date {
  return addDays(date, -days);
}

/**
 * Get the start of day (00:00:00.000) for a given date.
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get the end of day (23:59:59.999) for a given date.
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Check whether a given date is before the current time.
 */
export function isExpired(date: Date): boolean {
  return date.getTime() < Date.now();
}

/**
 * Format a date to ISO 8601 string.
 */
export function formatISO(date: Date): string {
  return date.toISOString();
}

/**
 * Calculate the difference in days between two dates (absolute value).
 */
export function diffInDays(dateA: Date, dateB: Date): number {
  const msPerDay = 86_400_000;
  return Math.abs(Math.floor((dateA.getTime() - dateB.getTime()) / msPerDay));
}
