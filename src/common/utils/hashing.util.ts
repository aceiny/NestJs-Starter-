import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '../constants/app.constant';

/**
 * Hash a plain text password using bcrypt.
 */
export async function hash(plainText: string, rounds: number = BCRYPT_SALT_ROUNDS): Promise<string> {
  return bcrypt.hash(plainText, rounds);
}

/**
 * Compare a plain text password with a bcrypt hash.
 */
export async function compare(plainText: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plainText, hashed);
}
