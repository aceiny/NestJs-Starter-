# Project Structure

A map of every folder and what goes where.

```
src/
├── main.ts                          # Entry point — calls CreateServer, sets prefix, starts listening
├── app.module.ts                    # Root module — imports config, database, redis, health
├── app.controller.ts                # Root controller (placeholder)
├── app.service.ts                   # Root service (placeholder)
│
├── cmd/
│   └── create.server.ts             # Server factory — configures all middleware, pipes, filters, interceptors
│
├── config/
│   ├── index.ts                     # Barrel export + merged Joi validation schema
│   ├── config.module.ts             # Global ConfigModule setup
│   ├── app.config.ts                # APP_NAME, APP_ENV, APP_PORT, APP_IP, API_VERSION
│   ├── database.config.ts           # DB_TYPE, DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME, ...
│   ├── redis.config.ts              # REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_DB
│   ├── jwt.config.ts                # JWT_SECRET, JWT_EXPIRES_IN
│   ├── mail.config.ts               # MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASSWORD, MAIL_FROM, MAIL_SECURE
│   ├── storage.config.ts            # STORAGE_ACCESS_KEY_ID, STORAGE_SECRET_ACCESS_KEY, STORAGE_REGION, ...
│   ├── platform.config.ts           # PLATFORM_WEB, PLATFORM_ADMIN, PLATFORM_MOBILE
│   ├── cors.config.ts               # buildCorsConfig() — uses typed config
│   ├── swagger.config.ts            # setupSwagger() — uses typed config
│   └── validation-pipe.config.ts    # Global ValidationPipe options
│
├── common/                          # Shared code — barrel-exported from common/index.ts
│   ├── index.ts                     # Re-exports everything below
│   │
│   ├── constants/
│   │   ├── index.ts
│   │   ├── app.constant.ts          # DEFAULT_PAGE, DEFAULT_LIMIT, MAX_PAGE_SIZE, BCRYPT_SALT_ROUNDS, ...
│   │   └── storage.constant.ts      # ALLOWED_FILE_TYPES, MAX_FILE_SIZE
│   │
│   ├── enums/
│   │   ├── index.ts
│   │   ├── sort-order.enum.ts       # SortOrder.ASC / DESC
│   │   └── environment.enum.ts      # Environment.DEVELOPMENT / STAGING / PRODUCTION / TEST
│   │
│   ├── interfaces/
│   │   ├── index.ts
│   │   ├── pagination.interface.ts  # PaginationMeta, PaginatedResponse, PaginateCallback, PaginateOptions
│   │   ├── api-response.interface.ts # ApiSuccessResponse, ApiErrorResponse, ApiResponse
│   │   └── client-info.interface.ts # ClientInfo, IpLocationInfo, ExtractReqInfoOptions
│   │
│   ├── utils/
│   │   ├── index.ts
│   │   ├── string.util.ts           # slugify, capitalize, camelToSnake, snakeToCamel, truncate, randomString, sanitizeInput
│   │   ├── math.util.ts             # clamp, randomInt, percentage, roundTo, isBetween, average
│   │   ├── date.util.ts             # now, addDays, subtractDays, startOfDay, endOfDay, isExpired, formatISO, diffInDays
│   │   ├── enum.util.ts             # enumToArray, enumValues, enumKeys, isValidEnumValue, normalizeEnumKey
│   │   ├── pagination.util.ts       # paginate, normalizePaginationOptions, buildPaginationMeta
│   │   ├── uuid.util.ts             # generateUUID
│   │   ├── hashing.util.ts          # hash, compare (bcrypt)
│   │   ├── response.util.ts         # successResponse, errorResponse
│   │   ├── request.util.ts          # extractReqInfo, isPrivateOrLocal (IP, UA, GeoIP)
│   │   ├── redis.util.ts            # buildRedisKey, serializeRedisValue, deserializeRedisValue
│   │   ├── storage.util.ts          # sanitizeFilename, generateUniqueFilename, buildS3Key, validateMimeType, ...
│   │   └── orm-filter.util.ts       # buildRangeFilter, buildILikeFilter, buildSearchFilter, mergeSearchConditions, ...
│   │
│   ├── decorators/
│   │   ├── index.ts
│   │   ├── pagination.decorator.ts  # @Pagination() — extracts page/limit from query
│   │   ├── public.decorator.ts      # @Public() — marks route as unauthenticated
│   │   └── serialize.decorator.ts   # @Serialize() — applies ClassSerializerInterceptor
│   │
│   ├── pipes/
│   │   ├── index.ts
│   │   ├── parse-date.pipe.ts       # Validates string → Date
│   │   └── parse-uuid.pipe.ts       # Validates string is UUID v4
│   │
│   ├── validators/
│   │   └── index.ts                 # Placeholder for custom validators
│   │
│   ├── exceptions/
│   │   ├── index.ts
│   │   └── business.exception.ts    # BusinessException — domain logic errors (default 422)
│   │
│   ├── filters/
│   │   ├── index.ts
│   │   └── global-exception.filter.ts # Catches HttpException, QueryFailedError, unknown errors
│   │
│   ├── interceptors/
│   │   ├── index.ts
│   │   ├── timeout.interceptor.ts           # Enforces request timeout (default 30s)
│   │   └── transform-response.interceptor.ts # Wraps responses in { success, data, meta? }
│   │
│   ├── guards/                      # Placeholder for auth guards
│   │
│   ├── helper/
│   │   ├── sanitize-req-body.helper.ts # Redacts sensitive fields in log output
│   │   ├── token-extractor.helper.ts   # JWT token extraction from headers
│   │   └── dynamic-import.helper.ts    # Dynamic ESM import helper
│   │
│   └── middleware/
│       └── browser-check-middleware.ts  # Browser detection middleware
│
├── database/
│   ├── database.module.ts           # TypeORM module setup
│   ├── data-source.ts               # TypeORM DataSource for CLI (migrations)
│   ├── migrations/                  # Migration files
│   └── seeds/                       # Seed data
│
├── modules/
│   ├── redis/
│   │   ├── redis.module.ts          # Global Redis module (ioredis)
│   │   └── redis.service.ts         # RedisService — get/set/del/exists/expire/incr/reset
│   │
│   └── health/
│       ├── health.module.ts         # Terminus health module
│       └── health.controller.ts     # GET /health — DB ping + memory check
│
├── shared/
│   ├── constant/                    # Legacy constants (being consolidated into common/)
│   └── interface/                   # Legacy interfaces
│
├── jobs/                            # Background job processors (placeholder)
└── interceptors/                    # Legacy interceptors folder
```

---

## Where to Put Things

| What you're adding          | Where it goes                                     |
| --------------------------- | ------------------------------------------------- |
| New API feature             | `src/modules/<feature>/`                          |
| Entity / model              | `src/modules/<feature>/<feature>.entity.ts`       |
| DTO                         | `src/modules/<feature>/dto/`                      |
| Shared utility function     | `src/common/utils/<name>.util.ts`                 |
| Shared interface / type     | `src/common/interfaces/<name>.interface.ts`        |
| Shared enum                 | `src/common/enums/<name>.enum.ts`                 |
| Shared constant             | `src/common/constants/app.constant.ts`            |
| Custom decorator            | `src/common/decorators/<name>.decorator.ts`       |
| Custom pipe                 | `src/common/pipes/<name>.pipe.ts`                 |
| Custom guard                | `src/common/guards/<name>.guard.ts`               |
| Custom exception            | `src/common/exceptions/<name>.exception.ts`       |
| Custom validator             | `src/common/validators/<name>.validator.ts`        |
| New config namespace        | `src/config/<name>.config.ts` (+ register in index) |
| Migration                   | `src/database/migrations/`                        |
| Seed data                   | `src/database/seeds/`                             |
| Background job              | `src/jobs/`                                       |

---

## Barrel Exports

The `src/common/index.ts` file re-exports everything from all subdirectories. This means you can import any shared utility, decorator, pipe, filter, or interface from a single path:

```typescript
import {
  slugify,
  paginate,
  Pagination,
  ParseDatePipe,
  BusinessException,
  GlobalExceptionFilter,
  TimeoutInterceptor,
  DEFAULT_LIMIT,
  SortOrder,
} from 'src/common';
```

Each subdirectory also has its own `index.ts` if you prefer more specific imports:

```typescript
import { slugify } from 'src/common/utils';
import { Pagination } from 'src/common/decorators';
```

---

## Module Pattern

When adding a new feature module, follow this structure:

```
src/modules/users/
├── users.module.ts        # Module definition
├── users.controller.ts    # REST endpoints
├── users.service.ts       # Business logic
├── users.entity.ts        # TypeORM entity
└── dto/
    ├── create-user.dto.ts
    └── update-user.dto.ts
```

Register the module in `app.module.ts`:

```typescript
@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    RedisModule,
    HealthModule,
    UsersModule, // add here
  ],
})
export class AppModule {}
```
