import type { FileSerializer } from "./FileSerializer";

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
  private fileSerializer?: FileSerializer;

  /**
   * @param {number} [defaultTtl=FIFTEEN_MINUTES_ms] - Default time to live for cached items in milliseconds. 0 means Infinite.
   * */
  constructor(
    {
      defaultTtl,
      fileSerializer,
    }: {
      defaultTtl?: CacheEntry["ttl"];
      fileSerializer?: FileSerializer;
    } = { defaultTtl: FIFTEEN_MINUTES_ms, fileSerializer: undefined }
  ) {
    this.defaultTtl = defaultTtl ?? FIFTEEN_MINUTES_ms;
    this.fileSerializer = fileSerializer;

    this.deserializeCacheFromFile()
      .then((persistedCache) => {
        this.cache = persistedCache ? new Map(persistedCache) : new Map();
      })
      .catch((error) => {
        console.warn("Failed to retrieve cache state from file.", error);
        this.cache = new Map();
      })
      .finally(() => this.flushExpired());
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
    this.serializeCacheToFile();
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

    this.serializeCacheToFile();
  }

  private serializeCacheToFile() {
    if (!this.fileSerializer) {
      const msg = "No file serializer provided. Skipping cache serialization.";
      console.warn(msg);
      return;
    }

    const data = Object.fromEntries(this.cache.entries());

    const serialized = this.fileSerializer.serialize(data);
    this.fileSerializer.saveToFile(serialized, (timestamp, uuid) => {
      return `cache_${timestamp}.json`;
    });
  }

  private async deserializeCacheFromFile() {
    if (!this.fileSerializer) {
      const msg =
        "No file serializer provided. Skipping cache deserialization.";
      console.warn(msg);
      return;
    }

    const cacheFileName = await this.findLatestCacheFile();
    if (!cacheFileName) throw new Error("No cache file found.");

    const serializedCache = await this.fileSerializer.retrieveFromFile(
      cacheFileName
    );

    if (!serializedCache) {
      throw new Error(`Failed to retrieve cache data from "${cacheFileName}"`);
    }

    const data = this.fileSerializer.deserialize<{}>(serializedCache);

    return Object.entries(data);
  }

  private async findLatestCacheFile(): Promise<string | null> {
    const exp = new RegExp(/cache_\d+\.json$/);
    const fileName = await this?.fileSerializer?.findFileName(exp);

    return fileName ?? null;
  }
}
