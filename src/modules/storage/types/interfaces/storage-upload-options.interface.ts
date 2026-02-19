import { type Readable } from 'stream';

export interface UploadOptions {
  key: string;
  body: Buffer | Readable | string;
  contentType?: string;
  metadata?: Record<string, string>;
  acl?: string;
}
