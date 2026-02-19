# Configuration System

All configuration lives in `src/config/` and follows a consistent pattern: **typed config namespace + Joi validation schema**.

---

## How It Works

Each config file exports two things:

1. **A `registerAs()` config namespace** — loads values from `process.env` and exposes them as a typed object.
2. **A Joi validation schema** — validates the env vars at startup. If anything is missing or invalid, the app crashes immediately with a clear error.

All configs are loaded together in `AppConfigModule` (`src/config/config.module.ts`), which is imported globally — so you can inject any config anywhere without re-importing `ConfigModule`.

```typescript
// src/config/config.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, platformConfig, databaseConfig, storageConfig, mailConfig, redisConfig, jwtConfig],
      validationSchema: configValidationSchema, // merged Joi schema
      validationOptions: { abortEarly: false },  // shows ALL errors, not just the first
    }),
  ],
})
export class AppConfigModule {}
```

The `configValidationSchema` is built by concatenating all individual Joi schemas in `src/config/index.ts`.

---

## Available Configs

### App (`src/config/app.config.ts`)

| Key          | Env Variable   | Type     | Description                  |
| ------------ | -------------- | -------- | ---------------------------- |
| `name`       | `APP_NAME`     | `string` | Application name             |
| `env`        | `APP_ENV`      | `string` | `development`, `staging`, or `production` |
| `port`       | `APP_PORT`     | `number` | HTTP listen port             |
| `ip`         | `APP_IP`       | `string` | Bind IP                      |
| `apiVersion` | `API_VERSION`  | `string` | API version prefix (e.g. `v1`) |

### Database (`src/config/database.config.ts`)

| Key                    | Env Variable                | Type      | Description                    |
| ---------------------- | --------------------------- | --------- | ------------------------------ |
| `type`                 | `DB_TYPE`                   | `string`  | `postgres`, `mysql`, `mariadb` |
| `host`                 | `DB_HOST`                   | `string`  | Database host                  |
| `port`                 | `DB_PORT`                   | `number`  | Database port                  |
| `username`             | `DB_USERNAME`               | `string`  | Database user                  |
| `password`             | `DB_PASSWORD`               | `string`  | Database password              |
| `name`                 | `DB_NAME`                   | `string`  | Database name                  |
| `synchronize`          | `DB_SYNCHRONIZE`            | `boolean` | Auto-sync entities (dev only!) |
| `logging`              | `DB_LOGGING`                | `boolean` | Log SQL queries                |
| `migrationsRun`        | `DB_MIGRATIONS_RUN`         | `boolean` | Auto-run migrations on start   |
| `migrationsTableName`  | `DB_MIGRATIONS_TABLE_NAME`  | `string`  | Migration history table name   |

### Redis (`src/config/redis.config.ts`)

| Key        | Env Variable     | Type     | Description    |
| ---------- | ---------------- | -------- | -------------- |
| `host`     | `REDIS_HOST`     | `string` | Redis host     |
| `port`     | `REDIS_PORT`     | `number` | Redis port     |
| `password` | `REDIS_PASSWORD` | `string` | Redis password |
| `db`       | `REDIS_DB`       | `number` | Redis DB index |

### JWT (`src/config/jwt.config.ts`)

| Key         | Env Variable     | Type     | Description                |
| ----------- | ---------------- | -------- | -------------------------- |
| `secret`    | `JWT_SECRET`     | `string` | Token signing secret       |
| `expiresIn` | `JWT_EXPIRES_IN` | `number` | Token TTL in seconds       |

### Mail (`src/config/mail.config.ts`)

| Key        | Env Variable    | Type      | Description           |
| ---------- | --------------- | --------- | --------------------- |
| `host`     | `MAIL_HOST`     | `string`  | SMTP server host      |
| `port`     | `MAIL_PORT`     | `number`  | SMTP port             |
| `user`     | `MAIL_USER`     | `string`  | SMTP username         |
| `password` | `MAIL_PASSWORD` | `string`  | SMTP password         |
| `from`     | `MAIL_FROM`     | `string`  | Default sender email  |
| `secure`   | `MAIL_SECURE`   | `boolean` | Use TLS               |

### Storage (`src/config/storage.config.ts`)

| Key              | Env Variable                 | Type     | Description          |
| ---------------- | ---------------------------- | -------- | -------------------- |
| `accessKeyId`    | `STORAGE_ACCESS_KEY_ID`      | `string` | S3 access key        |
| `secretAccessKey`| `STORAGE_SECRET_ACCESS_KEY`  | `string` | S3 secret key        |
| `region`         | `STORAGE_REGION`             | `string` | S3 region            |
| `bucket`         | `STORAGE_BUCKET_NAME`        | `string` | Bucket name          |
| `provider`       | `STORAGE_PROVIDER`           | `string` | `s3`, `minio`, etc.  |

### Platform (`src/config/platform.config.ts`)

| Key      | Env Variable      | Type     | Description           |
| -------- | ----------------- | -------- | --------------------- |
| `web`    | `PLATFORM_WEB`    | `string` | Frontend web URL      |
| `admin`  | `PLATFORM_ADMIN`  | `string` | Admin dashboard URL   |
| `mobile` | `PLATFORM_MOBILE` | `string` | Mobile backend URL    |

---

## Injecting Config in Your Code

Use NestJS typed config injection for type safety:

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { appConfig } from 'src/config/app.config';

@Injectable()
export class SomeService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly app: ConfigType<typeof appConfig>,
  ) {}

  getAppName(): string {
    return this.app.name; // fully typed, no process.env needed
  }
}
```

This pattern is used throughout the template (CORS, Swagger, `CreateServer`, etc.).

---

## Adding a New Config

1. Create `src/config/my-feature.config.ts`:

```typescript
import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const myFeatureConfig = registerAs('myFeature', () => ({
  apiKey: process.env.MY_FEATURE_API_KEY,
  timeout: parseInt(process.env.MY_FEATURE_TIMEOUT ?? '5000', 10),
}));

export const myFeatureConfigValidation = Joi.object({
  MY_FEATURE_API_KEY: Joi.string().required(),
  MY_FEATURE_TIMEOUT: Joi.number().default(5000),
});
```

2. Register it in `src/config/index.ts` — add the export and merge its validation into `configValidationSchema`.

3. Add it to the `load` array in `src/config/config.module.ts`.

That's it. Now you can `@Inject(myFeatureConfig.KEY)` anywhere.
