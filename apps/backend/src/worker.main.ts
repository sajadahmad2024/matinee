import { createServer, Server } from 'http';
import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';
import { LoggerService } from '@logger/logger.service';

/**
 * Standalone WORKER process — a headless Nest application context (no HTTP API). It runs the SQS
 * consumers + cron scheduler and is fully INDEPENDENT of the API process: the two communicate only
 * through SQS / Postgres / Redis, never by calling each other. It can therefore be deployed and
 * scaled as its own k3s Deployment (N replicas) — the API being up or down has no effect on it.
 *
 * Liveness: the worker has no HTTP server of its own, so when `WORKER_HEALTH_PORT` is set it exposes
 * a tiny health endpoint purely for orchestrator probes. If the event loop stalls (hung worker),
 * this stops responding → the liveness probe fails → k3s restarts the pod. This does NOT introduce
 * any dependency on the API.
 */
function startLivenessServer(isReady: () => boolean): Server | null {
  const port = Number(process.env['WORKER_HEALTH_PORT']);
  if (!port) {
    return null;
  }
  const server = createServer((_req, res) => {
    const ready = isReady();
    res.writeHead(ready ? 200 : 503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: ready ? 'ok' : 'starting', role: 'worker' }));
  });
  server.listen(port);
  return server;
}

async function bootstrap(): Promise<void> {
  let ready = false;
  const health = startLivenessServer(() => ready);

  const app = await NestFactory.createApplicationContext(WorkerModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });

  // Graceful shutdown: SIGTERM/SIGINT trigger onModuleDestroy → the consumer stops polling and
  // awaits in-flight handlers before the process exits (safe rolling deploys / scale-down).
  app.enableShutdownHooks();

  const logger = await app.resolve(LoggerService);
  ready = true;
  logger.log('Worker process started and listening for jobs...');

  const closeHealth = (): void => {
    health?.close();
  };
  process.once('SIGTERM', closeHealth);
  process.once('SIGINT', closeHealth);
}

// Exit non-zero on a failed boot so the orchestrator surfaces it (CrashLoopBackOff) and restarts —
// rather than leaving a silently dead worker that drains no queues.
bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Worker failed to start:', err);
  process.exit(1);
});
