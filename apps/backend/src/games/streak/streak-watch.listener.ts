import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EngagementEvent, WatchProgressPayload } from '../../engagement/events/engagement.events';
import { StreakService, StreakTodayView } from './streak.service';

/**
 * Engagement → games seam: every credited heartbeat re-evaluates today's streak. Awaited by the
 * heartbeat (emitAsync) so the response can echo `today`; a streak failure never fails the
 * heartbeat (returns undefined instead).
 */
@Injectable()
export class StreakWatchListener {
  private readonly logger = new Logger(StreakWatchListener.name);

  constructor(private readonly streak: StreakService) {}

  @OnEvent(EngagementEvent.WatchProgress)
  async onWatchProgress(payload: WatchProgressPayload): Promise<StreakTodayView | undefined> {
    try {
      const r = await this.streak.evaluate(payload.userId, payload.dayWatchSeconds);
      return r.today;
    } catch (err) {
      this.logger.error(`Streak evaluation failed for ${payload.userId}: ${(err as Error).message}`);
      return undefined;
    }
  }
}
