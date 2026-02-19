import { Injectable, Inject } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { createTransport } from 'nodemailer';
import { mailConfig } from '../../../config/mail.config';
import { type ConfigType } from '@nestjs/config';

@Injectable()
export class SmtpHealthIndicator {
  constructor(
    @Inject(mailConfig.KEY)
    private readonly mail: ConfigType<typeof mailConfig>,
    private readonly indicator: HealthIndicatorService,
  ) {}

  /**
   * SMTP is a non-critical check: connection failures are reported
   * as degraded (status: 'up' with an error message) rather than
   * 'down', so they won't cause a 503 on the health endpoint.
   */
  async check(key: string = 'smtp') {
    const session = this.indicator.check(key);
    try {
      const transporter = createTransport({
        host: this.mail.host,
        port: this.mail.port,
        secure: this.mail.secure,
        auth: { user: this.mail.user, pass: this.mail.password },
        connectionTimeout: 5000,
      });

      await transporter.verify();
      transporter.close();

      return session.up();
    } catch {
      // Return 'up' with a generic warning so terminus doesn't throw 503
      // and no internal details (hostnames, ports, etc.) are leaked.
      return session.up({ message: 'degraded — SMTP service unavailable' });
    }
  }
}
