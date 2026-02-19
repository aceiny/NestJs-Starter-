# Veil API

A production-ready **NestJS 11** starter with batteries included — typed config, Redis, health checks, security hardening, and a full common utilities layer. Clone it, add your modules, and ship.

## Tech Stack

| Layer | Tech |
|-------|------|
| Runtime | Node.js + TypeScript 5 |
| Framework | NestJS 11 |
| Database | TypeORM (MySQL / PostgreSQL) |
| Cache | ioredis (direct client) |
| Validation | class-validator, Zod, Joi |
| Auth helpers | bcrypt, JWT config |
| Docs | Swagger (auto-generated) |
| Security | Helmet, CORS, cookie-parser |
| Health | @nestjs/terminus (DB, Redis, Memory, SMTP, Storage) |
| Storage | @aws-sdk/client-s3 (S3, MinIO) |

## Features

- **Typed configuration** — `registerAs()` configs with Joi validation, injected via `ConfigType<>` (no raw `process.env`)
- **Global exception filter** — normalized error responses, FK violation handling, sanitized debug logs
- **Response interceptor** — consistent `{ success, data, meta? }` envelope
- **Timeout interceptor** — configurable request timeout via rxjs
- **Pagination** — callback-based `paginate()` utility with transform support
- **Redis module** — global ioredis client with retry strategy, exposed via `RedisService`
- **Storage module** — global S3 client (S3/MinIO), `StorageService` with upload, download, delete, list, copy, move
- **Health checks** — DB ping, heap memory, Redis ping, SMTP verify, S3 bucket (non-critical / degraded)
- **Common utilities** — string, math, date, enum, UUID, hashing, request info (GeoIP + UA parsing), ORM filters, storage helpers, Redis key builders
- **Security defaults** — Helmet, CORS config builder, cookie-parser, trust proxy
- **Migration support** — TypeORM CLI wired up with `data-source.ts`

## Quick Start

```bash
# clone
git clone <repo-url> && cd api

# install
yarn install

# configure
cp .env.example .env   # then fill in your values

# run migrations
yarn migration:run

# start dev server
yarn start:dev
```

## Scripts

```bash
yarn start:dev       # dev with watch mode
yarn start:debug     # dev with debugger
yarn build           # compile to dist/
yarn start:prod      # run compiled build
yarn lint            # eslint --fix
yarn format          # prettier
yarn test            # unit tests
yarn test:e2e        # e2e tests
yarn migration:generate src/database/migrations/<Name>
yarn migration:run
yarn migration:revert
```

## Project Structure

```
src/
├── main.ts                    # Bootstrap via CreateServer
├── cmd/                       # Server factory (Swagger, CORS, pipes, etc.)
├── config/                    # Typed configs (app, db, redis, mail, jwt, storage, cors, swagger)
├── database/                  # TypeORM data-source, migrations, seeds
├── common/
│   ├── constants/             # App-wide constants
│   ├── interfaces/            # Shared interfaces & DTOs
│   ├── utils/                 # String, math, date, enum, pagination, hashing, request, ORM, storage, Redis
│   ├── decorators/            # Pagination, Public, Serialize
│   ├── pipes/                 # ParseDate, ParseUUID
│   ├── exceptions/            # BusinessException
│   ├── filters/               # GlobalExceptionFilter
│   ├── guards/                # (extend here)
│   └── interceptors/          # Timeout, TransformResponse
├── modules/
│   ├── redis/                 # Global Redis module + service
│   ├── storage/               # Global Storage module + S3 service
│   └── health/                # Health controller + indicators (Redis, SMTP, Storage)
└── shared/                    # Legacy shared folder
```

## Docs

Detailed docs live in the [`docs/`](docs/) folder:

| Doc | Description |
|-----|-------------|
| [Getting Started](docs/GETTING-STARTED.md) | Setup, env vars, first run |
| [Configuration](docs/CONFIGURATION.md) | Config module & typed injection |
| [Common Utilities](docs/COMMON-UTILITIES.md) | All utility functions |
| [Pagination](docs/PAGINATION.md) | Callback-based pagination |
| [Storage](docs/STORAGE.md) | Storage module & S3 service |
| [Redis](docs/REDIS.md) | Redis module & helpers |
| [Error Handling](docs/ERROR-HANDLING.md) | Exception filter & BusinessException |
| [Security](docs/SECURITY.md) | Helmet, CORS, guards |
| [Project Structure](docs/PROJECT-STRUCTURE.md) | Full file map |
| [Migrations](docs/MIGRATIONS.md) | TypeORM migration workflow |

## Environment Variables

Key variables (see `.env.example` for the full list):

```env
APP_PORT=3000
APP_PREFIX=api

DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_NAME=veil

REDIS_HOST=localhost
REDIS_PORT=6379

MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=
MAIL_PASSWORD=

STORAGE_PROVIDER=s3
STORAGE_ENDPOINT=https://s3.amazonaws.com
STORAGE_BUCKET=my-bucket
STORAGE_REGION=us-east-1
STORAGE_ACCESS_KEY_ID=
STORAGE_SECRET_ACCESS_KEY=

JWT_SECRET=
JWT_EXPIRY=3600
```

## License

[MIT](LICENSE)
