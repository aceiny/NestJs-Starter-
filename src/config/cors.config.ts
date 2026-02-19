import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigType } from '@nestjs/config';
import { appConfig } from './app.config';
import { platformConfig } from './platform.config';

const DEV_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
];

/**
 * Build CORS options using typed NestJS config.
 * In development, local origins are allowed alongside platform origins.
 * In production, only platform origins are used.
 */
export function buildCorsConfig(
  app: ConfigType<typeof appConfig>,
  platform: ConfigType<typeof platformConfig>,
): CorsOptions {
  const platformOrigins = [
    platform.web,
    platform.admin,
    platform.mobile,
  ].filter(Boolean) as string[];

  const origins =
    app.env === 'development'
      ? [...DEV_ORIGINS, ...platformOrigins]
      : platformOrigins;

  return {
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  };
}
