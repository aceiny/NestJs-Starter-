import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const mailConfig = registerAs('mail', () => ({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT ?? '587', 10),
  user: process.env.MAIL_USER,
  password: process.env.MAIL_PASSWORD,
  from: process.env.MAIL_FROM,
  secure: process.env.MAIL_SECURE === 'true',
}));

export const mailConfigValidation = Joi.object({
  MAIL_HOST: Joi.string().required(),
  MAIL_PORT: Joi.number().required(),
  MAIL_USER: Joi.string().required(),
  MAIL_PASSWORD: Joi.string().required(),
  MAIL_FROM: Joi.string().email().required(),
  MAIL_SECURE: Joi.boolean().default(false),
});
