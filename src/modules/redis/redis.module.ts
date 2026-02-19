import { Module, Global } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import Redis from 'ioredis';
import { redisConfig } from '../../config/redis.config';
import { RedisService, REDIS_CLIENT } from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [redisConfig.KEY],
      useFactory: (config: ConfigType<typeof redisConfig>): Redis => {
        return new Redis({
          host: config.host,
          port: config.port,
          password: config.password || undefined,
          db: config.db,
          retryStrategy: (times) => Math.min(times * 200, 5000),
          maxRetriesPerRequest: 3,
          lazyConnect: false,
        });
      },
    },
    RedisService,
  ],
  exports: [RedisService, REDIS_CLIENT],
})
export class RedisModule {}
