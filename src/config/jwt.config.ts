import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  expiresIn: parseInt(process.env.JWT_EXPIRES_IN ?? '3600', 10),
}));

export const jwtConfigValidation = Joi.object({
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.number().default(3600),
});
