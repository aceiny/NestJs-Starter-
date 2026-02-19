import { Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { AppModule } from './app.module';
import { appConfig } from './config/app.config';
import { CreateServer } from './cmd/create.server';
import { platformConfig } from './config';

async function bootstrap() {
  const server = await CreateServer(AppModule);
  const logger = new Logger('Bootstrap');

  const appCfg = server.get<ConfigType<typeof appConfig>>(appConfig.KEY);
  const platformCfg = server.get<ConfigType<typeof platformConfig>>(platformConfig.KEY);
  // Global prefix
  server.setGlobalPrefix(`api/${appCfg.apiVersion}`);

  await server.listen(appCfg.port);
  logger.log(
  `${appCfg.name} running on port ${appCfg.port} [${appCfg.env}] - ` +
  `${platformCfg.api}`
);

}
bootstrap();
