import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const appConfig = registerAs('app', () => ({
  name: process.env.APP_NAME,
  env: process.env.APP_ENV,
  port: parseInt(process.env.APP_PORT!, 10) || 3000,
  ip: process.env.APP_IP,
  apiVersion: process.env.API_VERSION,
}));

export const appConfigValidation = Joi.object({
  APP_NAME: Joi.string().required(),
  APP_ENV: Joi.string().valid('development', 'staging', 'production').required(),
  APP_PORT: Joi.number().required(),
  APP_IP: Joi.string().ip().required(),
  API_VERSION: Joi.string().required(),
});
