/** Client IP location data resolved via GeoIP. */
export interface IpLocationInfo {
  city: string;
  country: string;
  region: string;
  timezone: string;
  latitude: number | null;
  longitude: number | null;
}

/** Extracted client information from an incoming HTTP request. */
export interface ClientInfo {
  /** Resolved client IP address */
  ip: string;
  /** Browser name (e.g. "Chrome", "Firefox") */
  browser: string;
  /** Operating system name (e.g. "Windows 10", "macOS") */
  os: string;
  /** Raw User-Agent header string */
  agent: string;
  /** GeoIP location data (only present when requested) */
  ipInfo?: IpLocationInfo;
}

/** Options for `extractReqInfo`. */
export interface ExtractReqInfoOptions {
  /** Resolve GeoIP location for the client IP. Default: `false` */
  extractLocationInfo?: boolean;
  /** Cache GeoIP results in Redis. Requires `RedisService` to be passed. Default: `false` */
  useCache?: boolean;
  /** Cache TTL in seconds when `useCache` is enabled. Default: `3600` (1 hour) */
  cacheTtl?: number;
}
