import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './modules/redis/redis.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    RedisModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
