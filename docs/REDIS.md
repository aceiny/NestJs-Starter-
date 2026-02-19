# Redis Module

The template includes a **global Redis module** built directly on [ioredis](https://github.com/redis/ioredis) — no `@nestjs/cache-manager` abstraction layer. This gives you full control over Redis while keeping it clean and injectable.

---

## Setup

The module is already imported in `AppModule` and registered as `@Global()`, so `RedisService` is available everywhere without extra imports.

```typescript
// src/app.module.ts
@Module({
  imports: [AppConfigModule, DatabaseModule, RedisModule, HealthModule],
})
export class AppModule {}
```

It reads connection settings from the Redis config (`REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_DB`) — see the [Configuration docs](./CONFIGURATION.md#redis-srcconfigredisconfigts).

---

## Using RedisService

Inject it into any service or controller:

```typescript
import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/modules/redis/redis.service';

@Injectable()
export class UserService {
  constructor(private readonly redis: RedisService) {}

  async getCachedUser(id: string) {
    // Try cache first
    const cached = await this.redis.get<User>(`user:${id}`);
    if (cached) return cached;

    // Fetch from DB and cache for 5 minutes
    const user = await this.userRepo.findOneBy({ id });
    if (user) {
      await this.redis.set(`user:${id}`, user, 300);
    }
    return user;
  }

  async invalidateUser(id: string) {
    await this.redis.del(`user:${id}`);
  }
}
```

---

## API Reference

### `get<T>(key: string): Promise<T | undefined>`

Retrieves a value by key. Automatically deserializes JSON. Returns `undefined` if the key doesn't exist.

```typescript
const user = await this.redis.get<User>('user:123');
```

### `set<T>(key: string, value: T, ttl?: number): Promise<void>`

Stores a value with an optional TTL in **seconds**. Default TTL: 60 seconds. Values are automatically JSON-serialized.

```typescript
await this.redis.set('session:abc', sessionData, 3600); // 1 hour
await this.redis.set('config:flags', flags);             // 60s default
await this.redis.set('permanent:key', data, 0);          // no expiration
```

### `del(...keys: string[]): Promise<number>`

Deletes one or more keys. Returns the number of keys removed.

```typescript
await this.redis.del('user:123');
await this.redis.del('cache:a', 'cache:b', 'cache:c');
```

### `exists(key: string): Promise<boolean>`

Checks whether a key exists.

```typescript
if (await this.redis.exists('rate-limit:user:123')) {
  throw new TooManyRequestsException();
}
```

### `expire(key: string, ttl: number): Promise<boolean>`

Sets or updates the TTL on an existing key. Returns `true` if the key exists and the timeout was set.

```typescript
await this.redis.expire('session:abc', 1800); // extend to 30 min
```

### `incr(key: string, amount?: number): Promise<number>`

Increments a key's integer value. Default increment: 1. Returns the new value.

```typescript
const count = await this.redis.incr('page-views:home');
const views = await this.redis.incr('api-calls:user:123', 5);
```

### `reset(): Promise<void>`

Flushes the current Redis database. **Use with extreme caution** — this deletes everything.

```typescript
await this.redis.reset(); // clears the entire DB
```

### `getClient(): Redis`

Returns the raw ioredis client for advanced operations (pub/sub, Lua scripts, pipelines, etc.).

```typescript
const client = this.redis.getClient();
const pipeline = client.pipeline();
pipeline.set('a', '1');
pipeline.set('b', '2');
await pipeline.exec();
```

---

## Direct Client Access

If you need the raw ioredis client without going through `RedisService`, you can inject it directly using the `REDIS_CLIENT` token:

```typescript
import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from 'src/modules/redis/redis.service';

@Injectable()
export class PubSubService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async publish(channel: string, message: string) {
    await this.redis.publish(channel, message);
  }
}
```

---

## Connection Configuration

The Redis client is configured with sensible defaults:

| Option                  | Value           | Description                                    |
| ----------------------- | --------------- | ---------------------------------------------- |
| `retryStrategy`         | `min(times*200, 5000)` | Exponential backoff, max 5 seconds      |
| `maxRetriesPerRequest`  | `3`             | Fail after 3 retries per command               |
| `lazyConnect`           | `false`         | Connect immediately on module init              |

The connection is automatically closed when the application shuts down (`OnModuleDestroy`).

---

## Common Patterns

### Cache-Aside

```typescript
async getWithCache<T>(key: string, ttl: number, fetcher: () => Promise<T>): Promise<T> {
  const cached = await this.redis.get<T>(key);
  if (cached !== undefined) return cached;

  const fresh = await fetcher();
  await this.redis.set(key, fresh, ttl);
  return fresh;
}
```

### Rate Limiting

```typescript
async checkRateLimit(userId: string, maxRequests: number, windowSec: number): Promise<boolean> {
  const key = `rate-limit:${userId}`;
  const current = await this.redis.incr(key);
  if (current === 1) {
    await this.redis.expire(key, windowSec);
  }
  return current <= maxRequests;
}
```

---

## Redis Utilities (`src/common/utils/redis.util.ts`)

Standalone helpers that don't require `RedisService` — handy for key building and serialization anywhere in the codebase.

### `buildRedisKey(...segments)`

Joins segments with `:` to create consistent keys.

```typescript
import { buildRedisKey } from 'src/common';

buildRedisKey('user', userId, 'session');  // 'user:abc-123:session'
buildRedisKey('cache', 'products', 'page', 1); // 'cache:products:page:1'
```

### `serializeRedisValue<T>(value)`

Serializes values for storage. Strings pass through, everything else is JSON-stringified.

### `deserializeRedisValue<T>(value)`

Reverses serialization. Parses JSON when possible, returns raw string otherwise. Returns `null` for `null` input.
