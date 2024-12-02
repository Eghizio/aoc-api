export const FIFTEEN_MINUTES_ms = 15 * 60 * 1000;

/**
 * @param {(number|undefined)} ttl - Time to live for cached items in milliseconds. 0 means Infinite.
 * @param {any} value - Cached value.
 * */
type CacheEntry = {
  ttl: number | undefined;
  value: any;
};

/* Todo: Add file serializer. */
export class Cache {
  private cache: Map<string, CacheEntry> = new Map();
  private defaultTtl: number;

  /**
   * @param {number} [defaultTtl=FIFTEEN_MINUTES_ms] - Default time to live for cached items in milliseconds. 0 means Infinite.
   * */
  constructor(defaultTtl: CacheEntry["ttl"] = FIFTEEN_MINUTES_ms) {
    this.defaultTtl = defaultTtl;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  get<T>(key: string): T | undefined {
    this.flushExpired();
    return this.cache.get(key)?.value;
  }

  /**
   * @param {number} [ttl=FIFTEEN_MINUTES_ms] - Time to live for cached items in milliseconds. 0 means Infinite.
   * */
  set<T>(key: string, value: T, ttl?: CacheEntry["ttl"]): void {
    this.cache.set(key, { value, ttl: ttl ?? this.defaultTtl });
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  /**
   * Deletes expired items from the cache.
   * */
  private flushExpired() {
    const now = Date.now();

    const expiredKeys = Array.from(this.cache.keys()).filter((key) => {
      const entry = this.cache.get(key);

      const isExpired =
        entry?.ttl === undefined || (entry.ttl < now && entry.ttl !== 0);

      return !entry || isExpired;
    });

    expiredKeys.forEach((key) => this.cache.delete(key));
  }
}
