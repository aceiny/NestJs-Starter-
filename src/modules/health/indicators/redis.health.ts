import { Injectable, Inject } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import Redis from 'ioredis';
import { REDIS_CLIENT } from 'src/modules/redis';

@Injectable()
export class RedisHealthIndicator {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly indicator: HealthIndicatorService,
  ) {}

  async check(key: string = 'redis') {
    const session = this.indicator.check(key);
    try {
      const response = await this.redis.ping();
      if (response === 'PONG') {
        return session.up();
      }
      return session.down({ message: `Unexpected PING response: ${response}` });
    } catch (error) {
      return session.down({
        message: error instanceof Error ? error.message : 'Redis connection failed',
      });
    }
  }
}
