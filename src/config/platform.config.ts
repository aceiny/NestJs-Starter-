import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const platformConfig = registerAs('platform', () => ({
  api : process.env.PLATFORM_API,
  web: process.env.PLATFORM_WEB,
  admin: process.env.PLATFORM_ADMIN,
  mobile: process.env.PLATFORM_MOBILE,
}));

export const platformConfigValidation = Joi.object({
  PLATFORM_API: Joi.string().uri().required().label('API platform URL'),
  PLATFORM_WEB: Joi.string().uri().allow('', null).label('Web platform URL'),
  PLATFORM_ADMIN: Joi.string().uri().allow('', null).label('Admin platform URL'),
  PLATFORM_MOBILE: Joi.string().uri().allow('', null).label('Mobile platform URL'),
});
