import { Injectable, Logger } from '@nestjs/common';

/**
 * Cron task implementations.
 *  - SYNC tasks (e.g. `heartbeat`) are cheap/in-process and run inline in the scheduler tick.
 *  - ASYNC task bodies (e.g. `sendDailyMail`) are invoked by a background queue HANDLER
 *    after the scheduler enqueues the job — so they get retry/DLQ/scaling.
 */
@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  /** SYNC example: trivial, fast, in-process — safe to run directly in the timer tick. */
  heartbeat(): void {
    this.logger.debug('cron heartbeat');
  }

  /** ASYNC body: invoked by DailyMailHandler off the queue (not in the timer tick). */
  async sendDailyMail(data?: unknown): Promise<void> {
    this.logger.debug(`Running daily mail job ${data ? JSON.stringify(data) : ''}`);
    // TODO: real daily digest logic
  }
}
