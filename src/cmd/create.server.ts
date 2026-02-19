import { ValidationPipe } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { json } from 'body-parser';
import { GlobalExceptionFilter, TimeoutInterceptor, TransformResponseInterceptor } from 'src/common';
import { ValidationPipeConfig } from 'src/config/validation-pipe.config';
import { buildCorsConfig } from 'src/config/cors.config';
import { setupSwagger } from 'src/config/swagger.config';
import { appConfig } from 'src/config/app.config';
import { platformConfig } from 'src/config/platform.config';
import cookieParser from 'cookie-parser';

// This function creates and configures a NestJS Express-based server
export async function CreateServer(
  AppModule: any,
): Promise<NestExpressApplication> {
  const server = await NestFactory.create<NestExpressApplication>(AppModule);

  // Resolve typed configs
  const appCfg = server.get<ConfigType<typeof appConfig>>(appConfig.KEY);
  const platformCfg = server.get<ConfigType<typeof platformConfig>>(platformConfig.KEY);

  // Set up Swagger for API documentation
  setupSwagger(server, appCfg, platformCfg);

  // Configure body parser to handle large JSON payloads and retain raw request body
  server.use(
    json({
      verify: (req: any, res, buf) => {
        req.rawBody = buf;
      },
      limit: '100mb',
    }),
  );

  // Trust the proxy headers (needed if the app runs behind a reverse proxy like Nginx)
  server.set('trust proxy', true);

  // Enable cookie parsing to read cookies from requests
  server.use(cookieParser());

  // Enable CORS using typed config
  server.enableCors(buildCorsConfig(appCfg, platformCfg));

  // Set up global validation pipes
  server.useGlobalPipes(new ValidationPipe(ValidationPipeConfig));

  // Use Helmet to set security-related HTTP headers
  server.use(helmet());

  // Register a global exception filter
  server.useGlobalFilters(new GlobalExceptionFilter());

    // Global interceptors
  server.useGlobalInterceptors(
      new TimeoutInterceptor(),
      new TransformResponseInterceptor(),
    );
  

  return server; // Return the configured server instance
}
