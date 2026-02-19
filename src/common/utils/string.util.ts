import { randomBytes } from 'crypto';
import { DEFAULT_RANDOM_STRING_LENGTH, MAX_SLUG_LENGTH } from '../constants/app.constant';

/**
 * Convert a string to a URL-friendly slug.
 * Removes diacritics, special characters, and normalizes whitespace.
 */
export function slugify(input: string, maxLength: number = MAX_SLUG_LENGTH): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, maxLength);
}

/**
 * Capitalize the first letter of a string.
 */
export function capitalize(input: string): string {
  if (!input) return input;
  return input.charAt(0).toUpperCase() + input.slice(1);
}

/**
 * Convert a camelCase string to snake_case.
 */
export function camelToSnake(input: string): string {
  return input
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
}

/**
 * Convert a snake_case string to camelCase.
 */
export function snakeToCamel(input: string): string {
  return input.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());
}

/**
 * Truncate a string to the specified length, appending a suffix if truncated.
 */
export function truncate(input: string, length: number, suffix: string = '...'): string {
  if (input.length <= length) return input;
  return input.slice(0, length - suffix.length) + suffix;
}

/**
 * Generate a cryptographically secure random string of the specified length.
 * Uses Node.js crypto.randomBytes for secure entropy.
 */
export function randomString(length: number = DEFAULT_RANDOM_STRING_LENGTH): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = randomBytes(length);
  return Array.from(bytes, (byte) => chars[byte % chars.length]).join('');
}

/**
 * Sanitize user input by stripping HTML tags and trimming whitespace.
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/&[^;]+;/g, '')
    .trim();
}
