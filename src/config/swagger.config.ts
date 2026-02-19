import { DocumentBuilder, SwaggerModule, OpenAPIObject } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { appConfig } from './app.config';
import { platformConfig } from './platform.config';

/**
 * Configure Swagger/OpenAPI documentation.
 * Disabled in production. Uses typed NestJS config for all env values.
 */
export function setupSwagger(
  app: INestApplication,
  appCfg: ConfigType<typeof appConfig>,
  platformCfg: ConfigType<typeof platformConfig>,
): void {
  if (appCfg.env === 'production') return;

  const platformOrigins = [
    platformCfg.web,
    platformCfg.admin,
    platformCfg.mobile,
  ].filter(Boolean) as string[];

  const servers =
    appCfg.env === 'production'
      ? platformOrigins.map((url) => ({ url, description: 'Production' }))
      : [
          { url: 'http://localhost:3000', description: 'Local environment' },
          { url: 'http://localhost:3001', description: 'Local environment 1' },
          { url: 'http://localhost:3002', description: 'Local environment 2' },
          { url: 'http://localhost:3003', description: 'Local environment 3' },
        ];

  const config = new DocumentBuilder()
    .setTitle(`${appCfg.name} API`)
    .setDescription(`API Documentation for ${appCfg.name}`)
    .setVersion(appCfg.apiVersion!)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
      },
      'session-auth',
    )
    .build();

  const document: OpenAPIObject = SwaggerModule.createDocument(app, config);

  document.servers = servers;
  document.security = [{ 'session-auth': [] }];

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      filter: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      defaultModelsExpandDepth: 3,
      defaultModelExpandDepth: 3,
      tagsSorter: 'alpha',
    },
    customSiteTitle: `${appCfg.name} API Docs`,
  });
}
