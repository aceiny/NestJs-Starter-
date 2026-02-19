import { Controller, Get } from '@nestjs/common';
import {
    HealthCheck,
    HealthCheckService,
    TypeOrmHealthIndicator,
    MemoryHealthIndicator,
} from '@nestjs/terminus';
import { HEAP_MEMORY_THRESHOLD } from '../../common/constants/app.constant';
import { RedisHealthIndicator } from './indicators/redis.health';
import { SmtpHealthIndicator } from './indicators/smtp.health';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly redis: RedisHealthIndicator,
    private readonly smtp: SmtpHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.memory.checkHeap('memory_heap', HEAP_MEMORY_THRESHOLD),
      () => this.redis.check('redis'),
      () => this.smtp.check('smtp'),
    ]);
  }
}
