import { randomBytes } from 'crypto';
import { Readable } from 'stream';
import { extname, join } from 'path';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../constants/storage.constant';

/**
 * Build a storage key/path from folder and filename
 * Ensures no duplicate slashes
 */
export const buildStorageKey = (folder: string, filename: string): string => {
  return join(folder, sanitizeFilename(filename));
};

/**
 * Sanitize a filename by replacing spaces and invalid characters
 */
export const sanitizeFilename = (filename: string): string => {
  return filename.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
};

/**
 * Extract file extension from filename using Node.js path library
 */
export const getFileExtension = (filename: string): string => {
    // extname returns '.jpg', '.png', so we remove the leading dot
  return extname(filename).replace(/^\./, '').toLowerCase();
};

/**
 * Generate a unique filename by appending timestamp + random string
 */
export const generateUniqueFilename = (filename: string): string => {
  const ext = getFileExtension(filename);
  const base = sanitizeFilename(filename.replace(/\.[^/.]+$/, ''));
  const unique = `${base}_${Date.now()}_${randomBytes(4).toString('hex')}`;
  return ext ? `${unique}.${ext}` : unique;
};

/**
 * Validate MIME type against allowed types
 * Defaults to ALLOWED_FILE_TYPES constant
 */
export const validateMimeType = (mime: string, allowedTypes: string[] = ALLOWED_FILE_TYPES): void => {
  if (!allowedTypes.includes(mime)) {
    throw new Error(`File type "${mime}" is not allowed`);
  }
};

/**
 * Validate file size (default max: MAX_FILE_SIZE)
 */
export const validateFileSize = (size: number, maxSize: number = MAX_FILE_SIZE): void => {
  if (size > maxSize) {
    throw new Error(`File size ${size} exceeds max allowed ${maxSize} bytes`);
  }
};

/**
 * Build S3-style key
 * Can be used for other cloud storage providers
 */
export const buildS3Key = (folder: string, filename: string): string => {
  return `${folder.replace(/\/+$/g, '')}/${sanitizeFilename(filename)}`;
};

/**
 * Convert Buffer to Readable stream
 */
export const bufferToStream = (buffer: Buffer): Readable => {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
};

/**
 * Generate a placeholder signed URL (implementation in StorageService)
 */
export const generateSignedUrl = (key: string, expiresInSeconds: number = 3600): string => {
  // Actual implementation depends on storage provider (S3, GCP, etc.)
  return `${key}?expires=${Date.now() + expiresInSeconds * 1000}`;
};
