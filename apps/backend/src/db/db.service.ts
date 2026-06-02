import { EnvConfig } from '@config/env.config';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './drizzle/schema';

export type DrizzleDB = NodePgDatabase<typeof schema>;

/**
 * A query executor — either the root db or an open transaction.
 * Repository methods accept this (defaulting to the root `db`) so the same
 * method composes inside a transaction or runs standalone.
 */
export type DBExecutor = DrizzleDB;

@Injectable()
export class DBService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DBService.name);
  private readonly pool: Pool;
  private _db!: DrizzleDB;

  constructor(config: ConfigService<EnvConfig>) {
    const databaseUrl = config.get<string>('DATABASE_URL') ?? '';
    // A POOL (not a single Client) is required for correct transaction isolation:
    // each transaction() checks out its own dedicated connection.
    this.pool = new Pool({ connectionString: databaseUrl, max: 20 });
    this._db = drizzle(this.pool, { schema });
  }

  get db(): DrizzleDB {
    return this._db;
  }

  /**
   * Run `fn` inside a single ACID transaction on a dedicated pooled connection;
   * commits on success, rolls back on any throw.
   */
  async transaction<T>(fn: (tx: DBExecutor) => Promise<T>): Promise<T> {
    return this._db.transaction(fn as unknown as Parameters<DrizzleDB['transaction']>[0]) as Promise<T>;
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.pool.query('SELECT 1');
      this.logger.log('Database pool connected');
    } catch (error) {
      this.logger.error('Database connection failed:', (error as Error).message);
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.pool.end();
      this.logger.log('Database pool closed');
    } catch (error) {
      this.logger.error('Error closing database pool:', (error as Error).message);
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.pool.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}
