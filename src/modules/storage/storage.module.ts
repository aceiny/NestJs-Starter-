import { Module, Global } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { storageConfig } from '../../config/storage.config';
import { StorageService } from './storage.service';
import { S3_CLIENT } from './storage.constants';

@Global()
@Module({
  providers: [
    {
      provide: S3_CLIENT,
      inject: [storageConfig.KEY],
      useFactory: (config: ConfigType<typeof storageConfig>): S3Client => {
        return new S3Client({
          endpoint: config.endpoint,
          region: config.region,
          credentials: {
            accessKeyId: config.accessKeyId!,
            secretAccessKey: config.secretAccessKey!,
          },
          forcePathStyle: config.provider === 'minio', 
        });
      },
    },
    StorageService,
  ],
  exports: [StorageService, S3_CLIENT],
})
export class StorageModule {}
