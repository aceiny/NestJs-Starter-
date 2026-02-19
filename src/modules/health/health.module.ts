import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { RedisHealthIndicator } from './indicators/redis.health';
import { SmtpHealthIndicator } from './indicators/smtp.health';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [RedisHealthIndicator, SmtpHealthIndicator],
})
export class HealthModule {}
