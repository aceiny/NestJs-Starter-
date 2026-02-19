import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const storageConfig = registerAs('storage', () => ({
  provider: process.env.STORAGE_PROVIDER || 's3',
  bucket: process.env.STORAGE_BUCKET,
  region: process.env.STORAGE_REGION,
  endpoint: process.env.STORAGE_ENDPOINT,
  accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
  secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
}));

export const storageConfigValidation = Joi.object({
  STORAGE_PROVIDER: Joi.string().valid('s3', 'minio', 'other').default('s3'),
  STORAGE_BUCKET: Joi.string().required(),
  STORAGE_ENDPOINT: Joi.string().uri().required(),
  STORAGE_REGION: Joi.string().required(),
  STORAGE_ACCESS_KEY_ID: Joi.string().required(),
  STORAGE_SECRET_ACCESS_KEY: Joi.string().required(),
});
