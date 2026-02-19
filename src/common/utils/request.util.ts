import { Request } from 'express';
import { getClientIp } from 'request-ip';
import { Logger } from '@nestjs/common';
import { UAParser } from 'ua-parser-js';
import { lookup } from 'geoip-lite';
import type {
    ClientInfo,
    ExtractReqInfoOptions,
    IpLocationInfo,
} from '../interfaces/client-info.interface';
import type { RedisService } from '../../modules/redis/redis.service';
import { buildRedisKey } from './redis.util';

const logger = new Logger('RequestUtil');

const GEOIP_CACHE_PREFIX = 'geoip:';
const DEFAULT_GEOIP_CACHE_TTL = 3600; // 1 hour

// ---------------------------------------------------------------------------
// Private IP / loopback detection
// ---------------------------------------------------------------------------

const PRIVATE_IPV4_RANGES: [number, number][] = [
  [ip4ToInt('10.0.0.0'), ip4ToInt('10.255.255.255')],       // 10.0.0.0/8
  [ip4ToInt('172.16.0.0'), ip4ToInt('172.31.255.255')],     // 172.16.0.0/12
  [ip4ToInt('192.168.0.0'), ip4ToInt('192.168.255.255')],   // 192.168.0.0/16
  [ip4ToInt('127.0.0.0'), ip4ToInt('127.255.255.255')],     // 127.0.0.0/8
];

function ip4ToInt(ip: string): number {
  return ip
    .split('.')
    .reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

/**
 * Returns `true` when the address is loopback, link-local, or
 * belongs to a private RFC-1918 / RFC-4193 range.
 */
export function isPrivateOrLocal(ip: string): boolean {
  // IPv6 loopback & link-local
  if (ip === '::1' || ip.startsWith('fe80:') || ip === '::ffff:127.0.0.1') {
    return true;
  }

  // Strip IPv4-mapped IPv6 prefix (::ffff:x.x.x.x)
  const normalized = ip.replace(/^::ffff:/i, '');

  // Validate as IPv4
  const parts = normalized.split('.');
  if (parts.length !== 4) return false;

  const numeric = ip4ToInt(normalized);
  return PRIVATE_IPV4_RANGES.some(([lo, hi]) => numeric >= lo && numeric <= hi);
}

// ---------------------------------------------------------------------------
// User-Agent parsing
// ---------------------------------------------------------------------------

interface ParsedAgent {
  browser: string;
  os: string;
  agent: string;
}

function parseUserAgent(req: Request): ParsedAgent {
  const raw = req.headers['user-agent'] ?? '';
  const parser = new UAParser(raw);
  const result = parser.getResult();

  return {
    browser: result.browser.name ?? 'unknown',
    os: result.os.name ?? 'unknown',
    agent: raw,
  };
}

// ---------------------------------------------------------------------------
// GeoIP resolution (with optional Redis cache)
// ---------------------------------------------------------------------------

async function resolveLocation(
  ip: string,
  redis?: RedisService,
  ttl: number = DEFAULT_GEOIP_CACHE_TTL,
): Promise<IpLocationInfo> {
  const cacheKey = buildRedisKey(GEOIP_CACHE_PREFIX, ip);

  // Try cache first
  if (redis) {
    const cached = await redis.get<IpLocationInfo>(cacheKey);
    if (cached) return cached;
  }

  const geo = lookup(ip);

  const info: IpLocationInfo = {
    city: geo?.city ?? 'unknown',
    country: geo?.country ?? 'unknown',
    region: geo?.region ?? 'unknown',
    timezone: geo?.timezone ?? 'unknown',
    latitude: geo?.ll?.[0] ?? null,
    longitude: geo?.ll?.[1] ?? null,
  };

  // Persist to cache
  if (redis) {
    await redis.set(cacheKey, info, ttl).catch((err) => {
      logger.warn(`Failed to cache GeoIP result for ${ip}: ${err}`);
    });
  }

  return info;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Extracts client information from an Express request.
 *
 * Works in middlewares, guards, interceptors, and controllers — anywhere
 * you have access to the raw Express `Request`.
 *
 * @param req     Express Request object
 * @param options Optional settings (location extraction, caching)
 * @param redis   Optional `RedisService` instance for GeoIP caching
 * @returns       Fully-typed `ClientInfo`
 *
 * @example
 * ```ts
 * // Basic usage (no location)
 * const info = await extractReqInfo(req);
 *
 * // With GeoIP location
 * const info = await extractReqInfo(req, { extractLocationInfo: true });
 *
 * // With GeoIP + Redis cache
 * const info = await extractReqInfo(
 *   req,
 *   { extractLocationInfo: true, useCache: true },
 *   this.redisService,
 * );
 * ```
 */
export async function extractReqInfo(
  req: Request,
  options: ExtractReqInfoOptions = {},
  redis?: RedisService,
): Promise<ClientInfo> {
  const {
    extractLocationInfo = false,
    useCache = false,
    cacheTtl = DEFAULT_GEOIP_CACHE_TTL,
  } = options;

  try {
    // 1. Resolve IP
    const rawIp = getClientIp(req) ?? '127.0.0.1';
    const ip = isPrivateOrLocal(rawIp) ? '127.0.0.1' : rawIp;

    // 2. Parse user-agent
    const { browser, os, agent } = parseUserAgent(req);

    // 3. Build base response
    const clientInfo: ClientInfo = { ip, browser, os, agent };

    // 4. Optionally resolve location
    if (extractLocationInfo) {
      const redisInstance = useCache ? redis : undefined;
      clientInfo.ipInfo = await resolveLocation(ip, redisInstance, cacheTtl);
    }

    return clientInfo;
  } catch (error) {
    const stack = error instanceof Error ? error.stack : undefined;
    logger.error('Failed to extract client info from request', stack);

    // Return safe defaults so callers never crash
    return {
      ip: '127.0.0.1',
      browser: 'unknown',
      os: 'unknown',
      agent: req.headers['user-agent'] ?? '',
    };
  }
}