import { EnvConfig } from '@config/env.config';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Cluster, Redis } from 'ioredis';
import { CACHE_CLIENT, CacheTtl } from './cache.constant';

/**
 * Application cache facade over a Redis-compatible store.
 *
 * Works identically against local Redis and AWS ElastiCache — only the
 * connection config (host / TLS / cluster) changes via env, never this code.
 *
 * Invalidation strategy:
 *  - `del(key)`            — drop a single entry.
 *  - `invalidateTag(tag)`  — bump a tag's version so every key bound to that
 *                            tag becomes unreachable at once (no SCAN/KEYS),
 *                            with stale entries expiring naturally by TTL.
 *  - `withLock(...)`       — single-flight guard to avoid cache stampedes.
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly prefix: string;
  private readonly defaultTtl: number;

  constructor(
    @Inject(CACHE_CLIENT) private readonly client: Redis | Cluster,
    config: ConfigService<EnvConfig>,
  ) {
    this.prefix = config.get<string>('CACHE_KEY_PREFIX') ?? 'app';
    this.defaultTtl = config.get<number>('CACHE_DEFAULT_TTL') ?? CacheTtl.DEFAULT;
  }

  /** Namespace a raw key with the configured prefix. */
  private k(key: string): string {
    return `${this.prefix}:${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.client.get(this.k(key));
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (error) {
      // Cache must never take down a request — fail open.
      this.logger.warn(`cache get failed for "${key}": ${(error as Error).message}`);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const ttl = ttlSeconds ?? this.defaultTtl;
    const payload = JSON.stringify(value);
    try {
      if (ttl > 0) {
        await this.client.set(this.k(key), payload, 'EX', ttl);
      } else {
        await this.client.set(this.k(key), payload);
      }
    } catch (error) {
      this.logger.warn(`cache set failed for "${key}": ${(error as Error).message}`);
    }
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length === 0) {
      return;
    }
    try {
      await this.client.del(...keys.map((key) => this.k(key)));
    } catch (error) {
      this.logger.warn(`cache del failed: ${(error as Error).message}`);
    }
  }

  /** Read-through: return cached value or compute, cache, and return it. */
  async getOrSet<T>(key: string, ttlSeconds: number, factory: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    const value = await factory();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  // ─── Tag (version-key) invalidation ─────────────────────────────────────────

  /** Current version counter for a tag (0 if never invalidated). */
  async tagVersion(tag: string): Promise<number> {
    const raw = await this.client.get(this.k(`tag:${tag}`));
    return raw ? parseInt(raw, 10) : 0;
  }

  /** Invalidate every key bound to a tag by bumping its version. */
  async invalidateTag(tag: string): Promise<void> {
    try {
      await this.client.incr(this.k(`tag:${tag}`));
    } catch (error) {
      this.logger.warn(`cache invalidateTag failed for "${tag}": ${(error as Error).message}`);
    }
  }

  /** Compose a key bound to the current versions of one or more tags. */
  async taggedKey(base: string, tags: string[]): Promise<string> {
    const versions = await Promise.all(tags.map((tag) => this.tagVersion(tag)));
    const suffix = tags.map((tag, i) => `${tag}=${versions[i] ?? 0}`).join(':');
    return `${base}:${suffix}`;
  }

  /** Read-through bound to tags; invalidate by bumping any of the tags. */
  async getOrSetTagged<T>(
    base: string,
    tags: string[],
    ttlSeconds: number,
    factory: () => Promise<T>,
  ): Promise<T> {
    const key = await this.taggedKey(base, tags);
    return this.getOrSet(key, ttlSeconds, factory);
  }

  // ─── Stampede guard ─────────────────────────────────────────────────────────

  /**
   * Run `fn` only if this caller wins the lock; otherwise returns null.
   * Prevents many concurrent requests recomputing the same expensive value.
   */
  async withLock<T>(lockKey: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T | null> {
    const namespaced = this.k(`lock:${lockKey}`);
    const token = `${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const acquired = await this.client.set(namespaced, token, 'EX', ttlSeconds, 'NX');
    if (acquired !== 'OK') {
      return null;
    }
    try {
      return await fn();
    } finally {
      const current = await this.client.get(namespaced);
      if (current === token) {
        await this.client.del(namespaced);
      }
    }
  }

  async ping(): Promise<boolean> {
    try {
      const res = await this.client.ping();
      return res === 'PONG';
    } catch {
      return false;
    }
  }
}
