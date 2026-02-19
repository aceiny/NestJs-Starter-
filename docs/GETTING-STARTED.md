# Getting Started

A production-ready NestJS API starter template with TypeORM, Redis, Swagger, and a rich set of built-in utilities.

---

## Prerequisites

- **Node.js** >= 18
- **Yarn** (package manager)
- **MySQL or PostgreSQL** database
- **Redis** server

---

## Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd api

# Install dependencies
yarn install
```

---

## Environment Variables

Create a `.env` file in the project root. Here's the full list of required variables:

### Application

| Variable       | Description               | Example               |
| -------------- | ------------------------- | --------------------- |
| `APP_NAME`     | Name of your application  | `MyApp`               |
| `APP_ENV`      | Environment               | `development`         |
| `APP_PORT`     | Port to listen on         | `3000`                |
| `APP_IP`       | Bind IP address           | `0.0.0.0`             |
| `API_VERSION`  | API version prefix        | `v1`                  |

### Database

| Variable                   | Description                       | Example              |
| -------------------------- | --------------------------------- | -------------------- |
| `DB_TYPE`                  | Database type                     | `postgres` or `mysql`|
| `DB_HOST`                  | Database host                     | `localhost`          |
| `DB_PORT`                  | Database port                     | `5432`               |
| `DB_USERNAME`              | Database username                 | `root`               |
| `DB_PASSWORD`              | Database password                 | `secret`             |
| `DB_NAME`                  | Database name                     | `myapp_dev`          |
| `DB_SYNCHRONIZE`           | Auto-sync schema (dev only!)      | `false`              |
| `DB_LOGGING`               | Enable SQL logging                | `true`               |
| `DB_MIGRATIONS_RUN`        | Run migrations on startup         | `false`              |
| `DB_MIGRATIONS_TABLE_NAME` | Migrations history table name     | `migrations_history` |

### Redis

| Variable         | Description    | Example     |
| ---------------- | -------------- | ----------- |
| `REDIS_HOST`     | Redis host     | `localhost` |
| `REDIS_PORT`     | Redis port     | `6379`      |
| `REDIS_PASSWORD` | Redis password | _(empty)_   |
| `REDIS_DB`       | Redis database | `0`         |

### JWT

| Variable         | Description             | Example          |
| ---------------- | ----------------------- | ---------------- |
| `JWT_SECRET`     | Secret key for signing  | `super-secret`   |
| `JWT_EXPIRES_IN` | Token TTL in seconds    | `3600`           |

### Mail

| Variable        | Description              | Example               |
| --------------- | ------------------------ | --------------------- |
| `MAIL_HOST`     | SMTP host                | `smtp.mailtrap.io`    |
| `MAIL_PORT`     | SMTP port                | `587`                 |
| `MAIL_USER`     | SMTP username            | `user`                |
| `MAIL_PASSWORD` | SMTP password            | `password`            |
| `MAIL_FROM`     | Default sender email     | `noreply@example.com` |
| `MAIL_SECURE`   | Use TLS                  | `false`               |

### Storage

| Variable                     | Description          | Example          |
| ---------------------------- | -------------------- | ---------------- |
| `STORAGE_ACCESS_KEY_ID`      | S3 access key        | `AKIAIOSFODNN7`  |
| `STORAGE_SECRET_ACCESS_KEY`  | S3 secret key        | `wJalr...`       |
| `STORAGE_REGION`             | S3 region            | `us-east-1`      |
| `STORAGE_BUCKET_NAME`        | Bucket name          | `my-bucket`      |
| `STORAGE_PROVIDER`           | Provider type        | `s3`             |

### Platform URLs

| Variable          | Description              | Example                     |
| ----------------- | ------------------------ | --------------------------- |
| `PLATFORM_WEB`    | Frontend web URL         | `https://app.example.com`   |
| `PLATFORM_ADMIN`  | Admin dashboard URL      | `https://admin.example.com` |
| `PLATFORM_MOBILE` | Mobile backend URL       | `https://m.example.com`     |

---

## Running the Application

```bash
# Development (with hot reload)
yarn start:dev

# Debug mode
yarn start:debug

# Production build
yarn build
yarn start:prod
```

The API will be available at `http://localhost:<APP_PORT>/api/<API_VERSION>/`.

---

## Swagger Documentation

When `APP_ENV` is not `production`, Swagger UI is automatically available at:

```
http://localhost:<APP_PORT>/docs
```

---

## Database Migrations

```bash
# Generate a migration from entity changes
yarn typeorm migration:generate src/database/migrations/MigrationName

# Create an empty migration
yarn typeorm migration:create src/database/migrations/MigrationName

# Run pending migrations
yarn migration:run

# Revert last migration
yarn migration:revert

# Show migration status
yarn migration:show
```

---

## Health Check

A health endpoint is available at:

```
GET /health
```

It checks:
- **Database** — ping check to verify the DB connection is alive
- **Memory** — heap usage stays under 256 MB

---

## Project Documentation

For deeper dives into specific areas, see the other docs:

| Document                                       | What it covers                                             |
| ---------------------------------------------- | ---------------------------------------------------------- |
| [Configuration](./CONFIGURATION.md)            | Config module, typed configs, Joi validation               |
| [Common Utilities](./COMMON-UTILITIES.md)      | String, math, date, enum, UUID, hashing, response helpers  |
| [Pagination](./PAGINATION.md)                  | Callback-based pagination, decorator, meta fields          |
| [Redis](./REDIS.md)                            | Redis module setup, RedisService API                       |
| [Error Handling](./ERROR-HANDLING.md)           | Global exception filter, BusinessException, response shape |
| [Security & Middleware](./SECURITY.md)          | CORS, Helmet, validation pipe, interceptors, guards        |
| [Project Structure](./PROJECT-STRUCTURE.md)     | Folder layout and where to put things                      |
| [Migrations](./MIGRATIONS.md)                  | Database migration workflow                                |
