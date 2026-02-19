import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { DEFAULT_CACHE_TTL } from '../../common/constants/app.constant';

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

/**
 * Injectable Redis service wrapping ioredis directly.
 * Provides typed get/set/del/reset with TTL and JSON serialization.
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly client: Redis) {}

  /**
   * Retrieve a cached value by key. Returns undefined if not found.
   */
  async get<T>(key: string): Promise<T | undefined> {
    const value = await this.client.get(key);
    if (value === null) return undefined;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  /**
   * Set a value in Redis with optional TTL (in seconds).
   * Values are JSON-serialized automatically.
   */
  async set<T>(key: string, value: T, ttl: number = DEFAULT_CACHE_TTL): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttl > 0) {
      await this.client.set(key, serialized, 'EX', ttl);
    } else {
      await this.client.set(key, serialized);
    }
  }

  /**
   * Delete one or more keys.
   */
  async del(...keys: string[]): Promise<number> {
    if (keys.length === 0) return 0;
    return this.client.del(...keys);
  }

  /**
   * Check if a key exists.
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  /**
   * Set the TTL (in seconds) on an existing key.
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    const result = await this.client.expire(key, ttl);
    return result === 1;
  }

  /**
   * Increment a key's integer value by 1 (or by `amount`).
   */
  async incr(key: string, amount: number = 1): Promise<number> {
    if (amount === 1) return this.client.incr(key);
    return this.client.incrby(key, amount);
  }

  /**
   * Flush the current database (use with caution).
   */
  async reset(): Promise<void> {
    await this.client.flushdb();
  }

  /**
   * Get the underlying ioredis client for advanced operations.
   */
  getClient(): Redis {
    return this.client;
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Closing Redis connection');
    await this.client.quit();
  }
}
