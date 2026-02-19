import { appConfigValidation } from './app.config';
import { databaseConfigValidation } from './database.config';
import { redisConfigValidation } from './redis.config';
import { mailConfigValidation } from './mail.config';
import { storageConfigValidation } from './storage.config';
import { jwtConfigValidation } from './jwt.config';
import { platformConfigValidation } from './platform.config';

//create a combined Joi schema for all configs
export const configValidationSchema = appConfigValidation
 .concat(platformConfigValidation)
  .concat(databaseConfigValidation)
  .concat(redisConfigValidation)
  .concat(mailConfigValidation)
  .concat(storageConfigValidation)
  .concat(jwtConfigValidation);


// export all configs and their validation schemas
export * from './app.config';
export * from './database.config';
export * from './redis.config';
export * from './mail.config';
export * from './storage.config';
export * from './jwt.config';
export * from './platform.config';