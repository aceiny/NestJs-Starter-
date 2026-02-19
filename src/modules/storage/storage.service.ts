import { Injectable, OnModuleDestroy, Logger, Inject } from '@nestjs/common';
import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    HeadObjectCommand,
    ListObjectsV2Command,
    CopyObjectCommand,
} from '@aws-sdk/client-s3';
import { type Readable } from 'stream';
import { storageConfig } from '../../config/storage.config';
import { type ConfigType } from '@nestjs/config';
import { S3_CLIENT } from './storage.constants';
import { type UploadOptions } from './types/interfaces/storage-upload-options.interface';
import { type StorageObject } from './types/interfaces/storage-object.interface';

/**
 * Injectable storage service wrapping @aws-sdk/client-s3.
 * Works with S3, MinIO, and any S3-compatible provider.
 */
@Injectable()
export class StorageService implements OnModuleDestroy {
  private readonly logger = new Logger(StorageService.name);
  private readonly bucket: string;

  constructor(
    @Inject(S3_CLIENT) private readonly client: S3Client,
    @Inject(storageConfig.KEY)
    private readonly config: ConfigType<typeof storageConfig>,
  ) {
    this.bucket = this.config.bucket!;
  }

  /**
   * Upload a file to storage.
   */
  async upload(options: UploadOptions): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: options.key,
        Body: options.body,
        ContentType: options.contentType,
        Metadata: options.metadata,
      }),
    );
    return options.key;
  }

  /**
   * Download a file as a readable stream.
   */
  async download(key: string): Promise<Readable> {
    const response = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    return response.Body as Readable;
  }

  /**
   * Delete a single object by key.
   */
  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  /**
   * Check if an object exists. Returns metadata if found, null otherwise.
   */
  async exists(key: string): Promise<StorageObject | null> {
    try {
      const response = await this.client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return {
        key,
        size: response.ContentLength,
        lastModified: response.LastModified,
        contentType: response.ContentType,
      };
    } catch {
      return null;
    }
  }

  /**
   * List objects under a given prefix.
   */
  async list(
    prefix: string,
    maxKeys: number = 1000,
  ): Promise<StorageObject[]> {
    const response = await this.client.send(
      new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
        MaxKeys: maxKeys,
      }),
    );

    return (response.Contents ?? []).map((item) => ({
      key: item.Key!,
      size: item.Size,
      lastModified: item.LastModified,
    }));
  }

  /**
   * Copy an object within the same bucket.
   */
  async copy(sourceKey: string, destinationKey: string): Promise<string> {
    await this.client.send(
      new CopyObjectCommand({
        Bucket: this.bucket,
        CopySource: `${this.bucket}/${sourceKey}`,
        Key: destinationKey,
      }),
    );
    return destinationKey;
  }

  /**
   * Move an object (copy + delete source).
   */
  async move(sourceKey: string, destinationKey: string): Promise<string> {
    await this.copy(sourceKey, destinationKey);
    await this.delete(sourceKey);
    return destinationKey;
  }

  /**
   * Get the underlying S3Client for advanced operations.
   */
  getClient(): S3Client {
    return this.client;
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Destroying S3 client');
    this.client.destroy();
  }
}
