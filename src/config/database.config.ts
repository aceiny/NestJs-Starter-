import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const databaseConfig = registerAs('database', () => ({
  type: process.env.DB_TYPE,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT!, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  name: process.env.DB_NAME,
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
  migrationsRun: process.env.DB_MIGRATIONS_RUN === 'true',
  migrationsTableName: process.env.DB_MIGRATIONS_TABLE_NAME || 'migrations_history',
}));

export const databaseConfigValidation = Joi.object({
  DB_TYPE: Joi.string().valid('postgres', 'mysql', 'mariadb').required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  DB_SYNCHRONIZE: Joi.boolean().required(),
  DB_LOGGING: Joi.boolean().required(),
  DB_MIGRATIONS_RUN: Joi.boolean().optional().default(false),
  DB_MIGRATIONS_TABLE_NAME: Joi.string().optional().default('migrations_history'),
});
