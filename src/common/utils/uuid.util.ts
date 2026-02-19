import { v4 } from 'uuid';

/**
 * Generate a new v4 UUID string.
 */
export function generateUUID(): string {
  return v4();
}
