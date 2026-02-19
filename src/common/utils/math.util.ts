import { randomInt as cryptoRandomInt } from 'crypto';

/**
 * Clamp a number between a minimum and maximum value.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate a cryptographically secure random integer between min (inclusive) and max (inclusive).
 */
export function randomInt(min: number, max: number): number {
  const lower = Math.ceil(min);
  const upper = Math.floor(max);
  return cryptoRandomInt(lower, upper + 1);
}

/**
 * Calculate the percentage of a part relative to a total.
 * Returns 0 if total is 0 to avoid division by zero.
 */
export function percentage(part: number, total: number): number {
  if (total === 0) return 0;
  return (part / total) * 100;
}

/**
 * Round a number to a specified number of decimal places.
 */
export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Check whether a value falls within a range (inclusive).
 */
export function isBetween(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Calculate the arithmetic mean of an array of numbers.
 * Returns 0 for an empty array.
 */
export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}
