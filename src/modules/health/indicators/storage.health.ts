import { Injectable, Inject } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';
import { storageConfig } from '../../../config/storage.config';
import { type ConfigType } from '@nestjs/config';
import { S3_CLIENT } from '../../storage/storage.constants';

@Injectable()
export class StorageHealthIndicator {
  constructor(
    @Inject(S3_CLIENT) private readonly client: S3Client,
    @Inject(storageConfig.KEY)
    private readonly storage: ConfigType<typeof storageConfig>,
    private readonly indicator: HealthIndicatorService,
  ) {}

  /**
   * Non-critical check — verifies the configured S3 bucket is reachable
   * via HeadBucket. Failures report degraded status, not down.
   */
  async check(key: string = 'storage') {
    const session = this.indicator.check(key);
    try {
      await this.client.send(
        new HeadBucketCommand({ Bucket: this.storage.bucket }),
      );
      return session.up();
    } catch {
      return session.up({ message: 'degraded — storage service unavailable' });
    }
  }
}
