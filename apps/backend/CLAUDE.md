# CLAUDE.md — NestJS 11 Enterprise Boilerplate

## Tech Stack

NestJS 11, TypeScript 5.9 (very strict), Drizzle ORM (SQL-first), PostgreSQL, AWS SQS for queues (ElasticMQ locally), Redis/ElastiCache for cache (ioredis), pnpm 8.15.0.

**Cloud portability:** queue + cache are env-driven — local↔stage↔prod with **no code change** (only env). Queue: `SQS_ENDPOINT` empty → real AWS SQS. Cache: `REDIS_HOST`/`REDIS_TLS_ENABLED`/`CACHE_CLUSTER_ENABLED` → ElastiCache. There is **no BullMQ** and **no Bull Board**.

## Commands

```bash
pnpm type-check             # TypeScript strict check (run before committing)
```

## TypeScript Strictness

The project uses maximum strictness. Key implications:

- `exactOptionalPropertyTypes` — cannot assign `undefined` to optional properties; use `?? defaultValue`
- `noUnusedLocals` / `noUnusedParameters` — prefix unused params with `_`
- `noUncheckedIndexedAccess` — array/object index access returns `T | undefined`
- `noPropertyAccessFromIndexSignature` — use bracket notation for index signatures
- `ConfigService.get<T>()` returns `T | undefined` — always use `?? defaultValue`

## Database (Drizzle ORM — SQL-First Workflow)

**Never use Drizzle Kit to generate migrations. Write raw SQL.**

1. Create migration: `pnpm db:create-migration <name>`
2. Write SQL in `src/db/drizzle/migrations/XXXX_<name>.sql`
3. Update journal: `src/db/drizzle/migrations/meta/_journal.json`
4. Apply: `pnpm db:migrate`
5. Regenerate schema: `pnpm db:introspect`
6. Schema output: `src/db/drizzle/schema.ts`

## Architecture Patterns

### Repository Pattern (Centralized under src/db/)
ALL repositories live in `src/db/repositories/<domain>/`. The global `DBModule` registers and exports all repositories, so any business module can inject any repository without cross-module coupling.

```
Controller (HTTP layer) -> Service (business logic/facade) -> Repository (DB access via @db/repositories/...)
                                                           -> Provider (external services)
```

**Repository location**: `src/db/repositories/<domain>/<name>.repository.ts`
**Import pattern**: `import { UsersRepository } from '@db/repositories/users/users.repository'`

### Provider/Strategy Pattern
External integrations use abstract base classes / driver tokens with swappable implementations, **selected by env (no code change local↔cloud)**:
- Email: SmtpProvider / SesProvider
- SMS: TwilioProvider / SnsProvider
- Queue: `SqsQueueDriver` behind the `QUEUE_DRIVER` token (ElasticMQ local / AWS SQS prod)
- Cache: `CacheService` over ioredis (Redis local / ElastiCache prod; standalone or cluster)

Provider/driver selection is done via factory/env in module registration.

### Module Structure (follow for every new domain module)

```
src/<module>/                          # Business logic module
  <module>.module.ts
  <module>.controller.ts               # HTTP layer only, @Controller({ path: RouteNames.X, version: '1' })
  <module>.service.ts                  # Business logic (Facade pattern)
  providers/
    <abstract>.provider.ts             # Abstract base class
    <impl>.provider.ts                 # Concrete implementation(s)
  dto/                                 # class-validator + class-transformer + @nestjs/swagger
  interfaces/
  guards/ or decorators/               # If module-specific

src/db/repositories/<module>/          # Data access (separate from business module)
  <module>.repository.ts               # Drizzle queries only
```

## Conventions

### Naming
- Route names: centralized in `src/common/route-names.ts` (RouteNames enum)

### Controllers
- Business controllers: `@Controller({ path: RouteNames.X, version: '1' })` — URI versioning at `/v1/...`
- Infrastructure controllers (health, metrics, tracing, dev-tools): `@Controller({ path: RouteNames.X, version: VERSION_NEUTRAL })` — no version prefix (`/health`, `/metrics`)
- Always use `RouteNames` enum for controller paths — never raw strings
- No business logic — delegate to services
- Register all route slugs in `src/common/route-names.ts`

### Services
- Orchestrate repositories and providers (Facade pattern)
- No direct DB calls — use repository methods

### Repositories
- Only place that imports from `@db/*` and runs Drizzle queries
- One repository per domain module

## Dev Tools & Observability

| Tool | URL | Purpose |
|------|-----|---------|
| Swagger v1 | `localhost:3000/api/v1` | API v1 documentation |
| Swagger | `localhost:3000/api` | Redirects to latest version |
| OpenAPI JSON | `localhost:3000/api/v1-json` | Spec for web/Flutter SDK generation |
| ElasticMQ | `localhost:9326` | Local SQS-compatible queue server |
| Prometheus | `localhost:9090` | Metrics |
| Grafana | `localhost:3001` | Dashboards |
| Jaeger | `localhost:16686` | Distributed tracing |
| Loki | `localhost:3100` | Log aggregation |

## Common Pitfalls

1. **Migration journal** — After creating a SQL migration file, the journal at `meta/_journal.json` must have a matching entry. `pnpm db:create-migration` handles this automatically.
2. **pnpm may not be on PATH** — Use `npx` as fallback if `pnpm` is not found
3. **Worker process** — API and Worker run concurrently. Worker entrypoint `src/worker.main.ts`. The **SQS consumer runs only in the worker** (`QueueConsumerModule` is imported by `WorkerModule`, not `AppModule`), so the cron scheduler and queue polling never run in the API.
4. **Env coercion** — flat `ConfigService.get()` returns correctly-typed values **only for keys in the Joi `validationSchema`** (`src/config/env-config.module.ts`). Add new number/boolean env vars there, else they read back as raw strings (`'false'` is truthy!).
5. **Queues** — enqueue with `QueueService.send(QueueName.X, JobName.Y, body)`; consume with a `@QueueHandler({ queue, name })` provider under `src/background/`. Retries/DLQ are SQS-native (visibility timeout + `QUEUE_MAX_RECEIVE_COUNT` redrive). Local queue server = ElasticMQ (`pnpm db:dev:up`).
6. **Cache** — use `CacheService` (not `@nestjs/cache-manager`). TTLs are in **seconds**. Invalidate groups via `invalidateTag(tag)` (version-key, no `SCAN`).
