# Common Utilities

All utilities live in `src/common/utils/` and are barrel-exported from `src/common`. Import them like:

```typescript
import { slugify, clamp, formatISO, hash, generateUUID } from 'src/common';
```

---

## String Utilities (`string.util.ts`)

Helpers for everyday string manipulation.

### `slugify(text: string): string`

Converts text into a URL-safe slug: lowercased, spaces become hyphens, special characters removed.

```typescript
slugify('Hello World!'); // 'hello-world'
slugify('  Spaced  Out  '); // 'spaced-out'
```

### `capitalize(text: string): string`

Uppercases the first letter.

```typescript
capitalize('hello'); // 'Hello'
```

### `camelToSnake(text: string): string`

Converts `camelCase` to `snake_case`.

```typescript
camelToSnake('createdAt'); // 'created_at'
```

### `snakeToCamel(text: string): string`

Converts `snake_case` to `camelCase`.

```typescript
snakeToCamel('created_at'); // 'createdAt'
```

### `truncate(text: string, maxLength: number, suffix?: string): string`

Trims a string to `maxLength` and appends a suffix (default `...`).

```typescript
truncate('A long sentence here', 10); // 'A long sen...'
```

### `randomString(length?: number): string`

Generates a cryptographically secure random hex string. Default length: 32.

```typescript
randomString();   // 64-char hex string (32 bytes)
randomString(16); // 32-char hex string (16 bytes)
```

Uses Node's `crypto.randomBytes` under the hood.

### `sanitizeInput(text: string): string`

Strips basic HTML/script tags from a string. Good for sanitizing user input.

```typescript
sanitizeInput('<script>alert("xss")</script>Hello'); // 'Hello'
```

---

## Math Utilities (`math.util.ts`)

### `clamp(value: number, min: number, max: number): number`

Constrains a number between `min` and `max`.

```typescript
clamp(150, 0, 100); // 100
clamp(-5, 0, 100);  // 0
```

### `randomInt(min: number, max: number): number`

Returns a cryptographically secure random integer between `min` (inclusive) and `max` (exclusive).

```typescript
randomInt(1, 100); // random number between 1 and 99
```

Uses `crypto.randomInt`.

### `percentage(part: number, total: number): number`

Calculates percentage. Returns 0 if total is 0.

```typescript
percentage(25, 200); // 12.5
```

### `roundTo(value: number, decimals?: number): number`

Rounds to a given number of decimal places (default 2).

```typescript
roundTo(3.14159, 3); // 3.142
```

### `isBetween(value: number, min: number, max: number): boolean`

Checks if a value falls within a range (inclusive).

```typescript
isBetween(5, 1, 10); // true
isBetween(11, 1, 10); // false
```

### `average(values: number[]): number`

Arithmetic mean. Returns 0 for an empty array.

```typescript
average([10, 20, 30]); // 20
```

---

## Date Utilities (`date.util.ts`)

### `now(): Date`

Returns the current date/time.

### `addDays(date: Date, days: number): Date`

Returns a new date with `days` added.

```typescript
addDays(new Date('2024-01-01'), 7); // 2024-01-08
```

### `subtractDays(date: Date, days: number): Date`

Returns a new date with `days` subtracted.

### `startOfDay(date: Date): Date`

Sets time to `00:00:00.000`.

### `endOfDay(date: Date): Date`

Sets time to `23:59:59.999`.

### `isExpired(date: Date): boolean`

Returns `true` if the date is before now.

```typescript
isExpired(new Date('2020-01-01')); // true
```

### `formatISO(date: Date): string`

Returns an ISO 8601 string representation.

### `diffInDays(dateA: Date, dateB: Date): number`

Absolute difference in days between two dates.

```typescript
diffInDays(new Date('2024-01-01'), new Date('2024-01-10')); // 9
```

---

## Enum Utilities (`enum.util.ts`)

Work with TypeScript enums without the quirks.

### `enumToArray(enumObj): { key, value }[]`

Converts an enum into an array of `{ key, value }` objects. Automatically handles numeric enum reverse-mapping.

```typescript
enum Status { Active = 'active', Inactive = 'inactive' }

enumToArray(Status);
// [{ key: 'Active', value: 'active' }, { key: 'Inactive', value: 'inactive' }]
```

### `enumValues(enumObj): T[keyof T][]`

Returns just the values.

```typescript
enumValues(Status); // ['active', 'inactive']
```

### `enumKeys(enumObj): string[]`

Returns just the keys.

```typescript
enumKeys(Status); // ['Active', 'Inactive']
```

### `isValidEnumValue(enumObj, value): boolean`

Type-safe check if a value belongs to an enum.

```typescript
isValidEnumValue(Status, 'active');  // true
isValidEnumValue(Status, 'deleted'); // false
```

### `normalizeEnumKey(key: string): string`

Turns an enum key into a human-readable label. Replaces underscores/hyphens with spaces and capitalizes each word.

```typescript
normalizeEnumKey('MY_ENUM_KEY');      // 'My Enum Key'
normalizeEnumKey('another-enum-key'); // 'Another Enum Key'
```

---

## UUID Utilities (`uuid.util.ts`)

### `generateUUID(): string`

Generates a random v4 UUID.

```typescript
generateUUID(); // 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d'
```

---

## Hashing Utilities (`hashing.util.ts`)

Built on `bcrypt` for secure password hashing.

### `hash(plainText: string, rounds?: number): Promise<string>`

Hashes a string with bcrypt. Default: 12 salt rounds.

```typescript
const hashed = await hash('myPassword');
```

### `compare(plainText: string, hashed: string): Promise<boolean>`

Compares a plain string against a bcrypt hash.

```typescript
const isValid = await compare('myPassword', hashed); // true
```

---

## Response Utilities (`response.util.ts`)

Helpers for building the standard API response envelope.

### `successResponse<T>(data: T, meta?: Record<string, unknown>): ApiSuccessResponse<T>`

```typescript
successResponse({ id: 1, name: 'Test' });
// { success: true, data: { id: 1, name: 'Test' } }

successResponse(items, { total: 100, page: 1 });
// { success: true, data: [...], meta: { total: 100, page: 1 } }
```

### `errorResponse(statusCode, message, path, errors?): ApiErrorResponse`

```typescript
errorResponse(404, 'User not found', '/api/v1/users/123');
// { success: false, error: { statusCode: 404, message: 'User not found', timestamp: '...', path: '/api/v1/users/123' } }
```

---

## Request Utilities (`request.util.ts`)

Extract client information (IP, browser, OS, geolocation) from Express requests. Works in middlewares, guards, interceptors, and controllers.

### `extractReqInfo(req, options?, redis?): Promise<ClientInfo>`

```typescript
// Basic — just IP, browser, OS
const info = await extractReqInfo(req);
// { ip: '203.0.113.5', browser: 'Chrome', os: 'Windows 10', agent: '...' }

// With GeoIP location
const info = await extractReqInfo(req, { extractLocationInfo: true });
// { ip: '...', browser: '...', os: '...', agent: '...', ipInfo: { city, country, region, timezone, latitude, longitude } }

// With Redis-cached GeoIP (avoids repeated lookups for the same IP)
const info = await extractReqInfo(
  req,
  { extractLocationInfo: true, useCache: true, cacheTtl: 3600 },
  this.redisService,
);
```

Options:

| Option                | Type      | Default | Description                          |
| --------------------- | --------- | ------- | ------------------------------------ |
| `extractLocationInfo` | `boolean` | `false` | Resolve GeoIP location               |
| `useCache`            | `boolean` | `false` | Cache GeoIP results in Redis         |
| `cacheTtl`            | `number`  | `3600`  | Cache TTL in seconds                 |

On error, returns safe defaults (`127.0.0.1`, `unknown`, `unknown`) instead of throwing.

### `isPrivateOrLocal(ip: string): boolean`

Detects private/local IPs: `127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `::1`, `fe80::*`, `::ffff:127.0.0.1`.

```typescript
isPrivateOrLocal('192.168.1.1'); // true
isPrivateOrLocal('8.8.8.8');     // false
isPrivateOrLocal('::1');         // true
```

---

## Redis Utilities (`redis.util.ts`)

Standalone helpers for working with Redis keys and serialization — no `RedisService` dependency required.

### `buildRedisKey(...segments: (string | number)[]): string`

Builds a colon-separated Redis key from segments.

```typescript
buildRedisKey('user', 123, 'profile'); // 'user:123:profile'
buildRedisKey('cache', 'articles', 'page', 2); // 'cache:articles:page:2'
```

### `serializeRedisValue<T>(value: T): string`

Serializes a value for Redis storage. Strings pass through, objects are JSON-stringified.

```typescript
serializeRedisValue({ name: 'Alice' }); // '{"name":"Alice"}'
serializeRedisValue('plain string');      // 'plain string'
```

### `deserializeRedisValue<T>(value: string | null): T | null`

Deserializes a Redis value. Parses JSON when possible, returns the raw string otherwise.

```typescript
deserializeRedisValue<User>('{"name":"Alice"}'); // { name: 'Alice' }
deserializeRedisValue(null); // null
```

---

## Storage Utilities (`storage.util.ts`)

Helpers for file uploads, filename sanitization, and cloud storage key generation.

### `sanitizeFilename(filename: string): string`

Replaces spaces with underscores and strips invalid characters.

```typescript
sanitizeFilename('my file (1).jpg'); // 'my_file_1.jpg'
```

### `getFileExtension(filename: string): string`

Returns the lowercase extension without the leading dot.

```typescript
getFileExtension('photo.PNG'); // 'png'
```

### `generateUniqueFilename(filename: string): string`

Creates a unique filename by appending a timestamp and cryptographically random hex suffix.

```typescript
generateUniqueFilename('avatar.png'); // 'avatar_1708300000000_a1b2c3d4.png'
```

### `buildStorageKey(folder: string, filename: string): string`

Builds a storage path by joining folder + sanitized filename (OS-style path).

```typescript
buildStorageKey('uploads/avatars', 'my photo.jpg'); // 'uploads/avatars/my_photo.jpg'
```

### `buildS3Key(folder: string, filename: string): string`

Builds an S3-style key (forward slashes, no trailing slash on folder).

```typescript
buildS3Key('uploads/avatars/', 'my photo.jpg'); // 'uploads/avatars/my_photo.jpg'
```

### `validateMimeType(mime: string, allowedTypes?: string[]): void`

Throws if the MIME type is not in the allowed list. Defaults to `ALLOWED_FILE_TYPES`.

```typescript
validateMimeType('image/png');        // OK
validateMimeType('application/exe');  // throws Error
```

### `validateFileSize(size: number, maxSize?: number): void`

Throws if the file size exceeds the maximum. Defaults to `MAX_FILE_SIZE` (10 MB).

```typescript
validateFileSize(5_000_000); // OK
validateFileSize(20_000_000); // throws Error
```

### `bufferToStream(buffer: Buffer): Readable`

Converts a Buffer to a Readable stream (useful for streaming uploads).

### `generateSignedUrl(key: string, expiresInSeconds?: number): string`

Placeholder for signed URL generation. Replace with your actual S3/GCP implementation.

---

## ORM Filter Utilities (`orm-filter.util.ts`)

TypeORM `FindOptionsWhere` builders — designed to be composed together when building dynamic filters.

### `buildRangeFilter(exactValue?, minValue?, maxValue?, options?)`

Builds a range condition for numeric or date fields.

```typescript
// Exact match
buildRangeFilter(100);              // Equal(100)

// Between
buildRangeFilter(undefined, 10, 50); // Between(10, 50)

// Min only
buildRangeFilter(undefined, 10);     // MoreThanOrEqual(10)

// Exclusive bounds
buildRangeFilter(undefined, 10, 50, { inclusive: false }); // Between with MoreThan/LessThan
```

### `buildILikeFilter(value?: string)`

Case-insensitive partial match.

```typescript
buildILikeFilter('john'); // ILike('%john%')
```

### `buildLikeFilter(value?: string)`

Case-sensitive partial match.

### `buildEqualityFilter<T>(value?: T)`

Exact match using `Equal()`.

### `buildEnumFilter<T>(enumObj, value?)`

Returns the value if it's a valid member of the enum, `undefined` otherwise.

```typescript
enum Status { Active = 'active', Inactive = 'inactive' }
buildEnumFilter(Status, 'active');  // 'active'
buildEnumFilter(Status, 'deleted'); // undefined
```

### `buildRelationFilter(value?, options?)`

Builds a `{ id: Equal(value) }` condition for relation filtering. Validates UUID v4.

```typescript
buildRelationFilter('a1b2c3d4-...'); // { id: Equal('a1b2c3d4-...') }
buildRelationFilter(null, { allowNull: true }); // { id: IsNull() }
```

### `buildRelationFieldFilter(field, value?)`

Same as above but for a custom field name instead of `id`.

### `buildRelationFieldILikeFilter(field, value?)`

ILike search on a relation field.

### `buildSearchFilter<T>(search, fields)`

Builds OR-conditions for searching across multiple entity fields. Supports multi-word queries.

```typescript
buildSearchFilter<User>('John Doe', ['firstName', 'lastName']);
// Returns array of FindOptionsWhere to use in TypeORM `where`
```

### `mergeSearchConditions<T>(andFilters, searchConditions?)`

Merges AND filters with OR search conditions into a combined where clause.

```typescript
const filters = { active: true };
const search = buildSearchFilter<User>('John', ['firstName', 'lastName']);
const where = mergeSearchConditions(filters, search);
// [{ active: true, firstName: ILike('%John%') }, { active: true, lastName: ILike('%John%') }]
```

---

## Constants (`constants/app.constant.ts`)

Sensible defaults used throughout the template:

| Constant                      | Value          | Used by                           |
| ----------------------------- | -------------- | --------------------------------  |
| `DEFAULT_PAGE`                | `1`            | Pagination                        |
| `DEFAULT_LIMIT`               | `10`           | Pagination                        |
| `MIN_PAGE`                    | `1`            | Pagination validation             |
| `MAX_PAGE_SIZE`               | `100`          | Pagination cap                    |
| `DEFAULT_CACHE_TTL`           | `60` (seconds) | Redis service                     |
| `MAX_CACHE_TTL`               | `3600`         | Redis TTL upper bound             |
| `DEFAULT_TIMEOUT_MS`          | `30000` (ms)   | Timeout interceptor               |
| `MAX_SLUG_LENGTH`             | `255`          | String utilities                  |
| `DEFAULT_RANDOM_STRING_LENGTH`| `32`           | `randomString()` default length   |
| `BCRYPT_SALT_ROUNDS`          | `12`           | Hashing utilities                 |
| `HEAP_MEMORY_THRESHOLD`       | `256 MB`       | Health check                      |

### Storage Constants (`constants/storage.constant.ts`)

| Constant             | Value                                                                              |
| -------------------- | ---------------------------------------------------------------------------------- |
| `ALLOWED_FILE_TYPES` | `image/png`, `image/jpeg`, `image/jpg`, `image/gif`, `application/pdf`, `application/zip` |
| `MAX_FILE_SIZE`      | `10 MB` (10 * 1024 * 1024 bytes)                                                  |

---

## Enums

### `SortOrder` (`enums/sort-order.enum.ts`)

```typescript
enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}
```

### `Environment` (`enums/environment.enum.ts`)

```typescript
enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TEST = 'test',
}
```
