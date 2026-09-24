import { Logger } from '@nestjs/common';
import { config as loadDotenv } from 'dotenv';

// A long-running worker must NEVER die silently — a dead worker drains no queues while the API
// stays up and looks healthy (the exact failure we hit locally). So we fail LOUD and exit non-zero
// on any fatal condition; the supervisor restarts us:
//   • prod/k3s   → the Deployment restarts the pod (CrashLoopBackOff surfaces it)
//   • local dev  → `concurrently --restart-tries -1` (see package.json start:dev) respawns the child
// Per-message handler errors are already contained by the consumer's poll loop (they redrive to the
// DLQ), so these guards only catch truly unexpected escapes — and make them visible instead of fatal-silent.
process.on('unhandledRejection', (reason) => {
  // eslint-disable-next-line no-console
  console.error('[worker] FATAL unhandledRejection — exiting for restart:', reason);
  process.exit(1);
});
process.on('uncaughtException', (err) => {
  // eslint-disable-next-line no-console
  console.error('[worker] FATAL uncaughtException — exiting for restart:', err);
  process.exit(1);
});

// See `src/main.ts` for why `WorkerModule` must not be `require()`'d until Secrets Manager
// hydration finishes when `DEPLOYMENT_TARGET=aws`, and why `.env` must be loaded explicitly here.
async function main(): Promise<void> {
  loadDotenv();

  // Relative path on purpose: the build rewrites path aliases (@config/…) in static imports
  // only — an aliased dynamic import() compiles to require('@config/…') and crashes at runtime.
  const { hydrateSecretsIfNeeded } = await import('./config/secrets-bootstrap');
  await hydrateSecretsIfNeeded();

  const { bootstrap } = await import('./worker-bootstrap');
  await bootstrap();
}

main().catch((error: unknown) => {
  Logger.error(
    `Failed to bootstrap worker: ${error instanceof Error ? error.message : String(error)}`,
    error instanceof Error ? error.stack : undefined,
    'Bootstrap',
  );
  process.exit(1);
});
