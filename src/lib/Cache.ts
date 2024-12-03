import { Logger } from "./Logger";

export const FIFTEEN_MINUTES_ms = 15 * 60 * 1_000;

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
  private logger: Logger;

  /**
   * @param {number} [defaultTtl=FIFTEEN_MINUTES_ms] - Default time to live for cached items in milliseconds. 0 means Infinite.
   * */
  constructor({
    defaultTtl,
    logger,
  }: {
    defaultTtl?: CacheEntry["ttl"];
    logger?: Logger;
  }) {
    this.defaultTtl = defaultTtl ?? FIFTEEN_MINUTES_ms;
    this.logger = logger ?? new Logger();
  }

  has(key: string): boolean {
    const result = this.cache.has(key);

    if (!result) this.logger.danger(`Cache miss ${key}`);

    return result;
  }

  get<T>(key: string): T | undefined {
    this.flushExpired();
    this.logger.success(`Cache hit ${key}`);
    return this.cache.get(key)?.value;
  }

  /**
   * @param {number} [ttl=FIFTEEN_MINUTES_ms] - Time to live for cached items in milliseconds. 0 means Infinite.
   * */
  set<T>(key: string, value: T, ttl?: CacheEntry["ttl"]): void {
    this.logger.message(`Caching ${key}`);
    this.cache.set(key, { value, ttl: Date.now() + (ttl ?? this.defaultTtl) });
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
        entry?.ttl === undefined || (entry.ttl !== 0 && entry.ttl < now);

      return !entry || isExpired;
    });

    this.logger.message(`Flushing ${expiredKeys.length} items:`, expiredKeys);

    expiredKeys.forEach((key) => this.cache.delete(key));
  }
}
