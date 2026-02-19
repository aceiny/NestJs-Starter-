# Storage Module

The template includes a **global Storage module** built on [@aws-sdk/client-s3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/). It works with **S3**, **MinIO**, and any S3-compatible object storage. The S3 client is shared across the app via a single `S3_CLIENT` token.

---

## Setup

The module is already imported in `AppModule` and registered as `@Global()`, so `StorageService` is available everywhere without extra imports.

```typescript
// src/app.module.ts
@Module({
  imports: [AppConfigModule, DatabaseModule, RedisModule, StorageModule, HealthModule],
})
export class AppModule {}
```

It reads connection settings from the storage config — see the [Configuration docs](./CONFIGURATION.md).

### Environment Variables

| Variable                    | Description           | Example                    |
| --------------------------- | --------------------- | -------------------------- |
| `STORAGE_PROVIDER`          | Provider type         | `s3` or `minio`            |
| `STORAGE_ENDPOINT`          | S3-compatible endpoint| `https://s3.amazonaws.com` |
| `STORAGE_BUCKET`            | Bucket name           | `my-bucket`                |
| `STORAGE_REGION`            | Region                | `us-east-1`                |
| `STORAGE_ACCESS_KEY_ID`     | Access key            | `AKIAIOSFODNN7`            |
| `STORAGE_SECRET_ACCESS_KEY` | Secret key            | `wJalr...`                 |

> When `STORAGE_PROVIDER` is `minio`, the module automatically enables `forcePathStyle` for compatibility.

---

## Using StorageService

Inject it into any service or controller:

```typescript
import { Injectable } from '@nestjs/common';
import { StorageService } from 'src/modules/storage';

@Injectable()
export class DocumentService {
  constructor(private readonly storage: StorageService) {}

  async uploadDocument(file: Express.Multer.File) {
    const key = `documents/${Date.now()}_${file.originalname}`;
    await this.storage.upload({
      key,
      body: file.buffer,
      contentType: file.mimetype,
    });
    return key;
  }

  async getDocument(key: string) {
    return this.storage.download(key);
  }

  async removeDocument(key: string) {
    await this.storage.delete(key);
  }
}
```

---

## API Reference

### `upload(options: UploadOptions): Promise<string>`

Uploads a file and returns the key.

```typescript
const key = await this.storage.upload({
  key: 'avatars/user-123.jpg',
  body: fileBuffer,
  contentType: 'image/jpeg',
  metadata: { uploadedBy: 'user-123' },
});
```

### `download(key: string): Promise<Readable>`

Downloads a file as a readable stream.

```typescript
const stream = await this.storage.download('avatars/user-123.jpg');
stream.pipe(res); // pipe to Express response
```

### `delete(key: string): Promise<void>`

Deletes a single object.

```typescript
await this.storage.delete('avatars/user-123.jpg');
```

### `exists(key: string): Promise<StorageObject | null>`

Checks if an object exists. Returns metadata (`key`, `size`, `lastModified`, `contentType`) or `null`.

```typescript
const meta = await this.storage.exists('avatars/user-123.jpg');
if (meta) {
  console.log(`Size: ${meta.size} bytes`);
}
```

### `list(prefix: string, maxKeys?: number): Promise<StorageObject[]>`

Lists objects under a prefix. Default max: 1000.

```typescript
const files = await this.storage.list('documents/', 100);
files.forEach(f => console.log(f.key, f.size));
```

### `copy(sourceKey: string, destinationKey: string): Promise<string>`

Copies an object within the same bucket. Returns the destination key.

```typescript
await this.storage.copy('temp/upload.pdf', 'documents/final.pdf');
```

### `move(sourceKey: string, destinationKey: string): Promise<string>`

Moves an object (copy + delete source). Returns the destination key.

```typescript
await this.storage.move('temp/upload.pdf', 'documents/final.pdf');
```

### `getClient(): S3Client`

Returns the raw `S3Client` for advanced operations (presigned URLs, multipart uploads, etc.).

```typescript
const client = this.storage.getClient();
```

---

## Direct Client Access

If you need the raw S3 client without going through `StorageService`, inject it via the `S3_CLIENT` token:

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { S3_CLIENT } from 'src/modules/storage';

@Injectable()
export class CustomS3Service {
  constructor(@Inject(S3_CLIENT) private readonly s3: S3Client) {}
}
```

---

## Module Structure

```
src/modules/storage/
├── index.ts                 # Barrel export
├── storage.constants.ts     # S3_CLIENT symbol token
├── storage.module.ts        # Global module, S3Client factory
├── storage.service.ts       # StorageService — upload/download/delete/exists/list/copy/move
└── types/
    ├── index.ts
    └── interfaces/
        ├── storage-upload-options.interface.ts  # UploadOptions
        └── storage-object.interface.ts          # StorageObject
```

---

## Health Check

The storage health indicator verifies the configured bucket is reachable via `HeadBucket`. It's **non-critical** — failures report `"degraded — storage service unavailable"` without causing a 503 on the `/health` endpoint. The indicator reuses the shared `S3_CLIENT` token.

---

## Types

### `UploadOptions`

```typescript
interface UploadOptions {
  key: string;
  body: Buffer | Readable | string;
  contentType?: string;
  metadata?: Record<string, string>;
  acl?: string;
}
```

### `StorageObject`

```typescript
interface StorageObject {
  key: string;
  size?: number;
  lastModified?: Date;
  contentType?: string;
}
```

Both are exported from `src/modules/storage` via the barrel index.
