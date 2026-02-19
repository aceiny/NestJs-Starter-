import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const storageConfig = registerAs('storage', () => ({
  accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
  secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
  region: process.env.STORAGE_REGION,
  bucket: process.env.STORAGE_BUCKET_NAME,
  provider: process.env.STORAGE_PROVIDER || 's3',
}));

export const storageConfigValidation = Joi.object({
  STORAGE_ACCESS_KEY_ID: Joi.string().required(),
  STORAGE_SECRET_ACCESS_KEY: Joi.string().required(),
  STORAGE_REGION: Joi.string().required(),
  STORAGE_BUCKET_NAME: Joi.string().required(),
  STORAGE_PROVIDER: Joi.string().valid('s3', 'minio', 'other').default('s3'),
});
