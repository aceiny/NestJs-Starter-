import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  appConfig,
  databaseConfig,
  storageConfig,
  platformConfig,
  mailConfig,
  redisConfig,
  jwtConfig,
  configValidationSchema,
} from './index';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        platformConfig,
        databaseConfig,
        storageConfig,
        mailConfig,
        redisConfig,
        jwtConfig,
      ],
      validationSchema: configValidationSchema,
      validationOptions: { abortEarly: false },
    }),
  ],
})
export class AppConfigModule {}
