import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  password: process.env.REDIS_PASSWORD || '',
  db: parseInt(process.env.REDIS_DB ?? '0', 10),
}));

export const redisConfigValidation = Joi.object({
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow(''),
  REDIS_DB: Joi.number().default(0),
});
