import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProgressRecord, ViewRepository, WatchEventInput } from '@db/repositories/engagement/view.repository';
import { EngagementEvent, WatchProgressPayload } from '../events/engagement.events';
import { ContentAccessService } from '../services/content-access.service';
import { HeartbeatDto, IngestWatchEventsDto, StartViewDto } from './dto/view.dto';

/** A session becomes a counted view after this much watching. */
export const VIEW_COUNT_MIN_SECONDS = 3;
/** Unfinished sessions younger than this are reused by `start` (no new view). */
export const VIEW_REUSE_MINUTES = 30;
/** A user's views of the same content count at most once per this window. */
export const VIEW_RECOUNT_MINUTES = 30;

export interface StreakToday {
  date: string;
  watchSeconds: number;
  requiredSeconds: number;
  remainingSeconds: number;
  qualified: boolean;
}

@Injectable()
export class ViewService {
  constructor(
    private readonly views: ViewRepository,
    private readonly access: ContentAccessService,
    private readonly events: EventEmitter2,
  ) {}

  /** Open (or reuse) a viewing session. Doesn't count a view yet — see heartbeat. */
  async start(userId: string, contentId: string, dto: StartViewDto): Promise<{ viewId: string; resumed: boolean }> {
    await this.access.assertPublished(contentId);
    return this.views.startView(userId, contentId, {
      ...(dto.sessionId ? { sessionId: dto.sessionId } : {}),
      ...(dto.device ? { device: dto.device } : {}),
      ...(dto.source ? { source: dto.source } : {}),
      reuseMinutes: VIEW_REUSE_MINUTES,
    });
  }

  /**
   * Heartbeat: credit wall-clock-capped watch time, count the view once it's real, save the
   * resume point, then let the streak engine qualify the day (awaited so `today` is current).
   */
  async heartbeat(
    userId: string,
    contentId: string,
    viewId: string,
    dto: HeartbeatDto,
  ): Promise<ProgressRecord & { today?: StreakToday }> {
    await this.access.assertPublished(contentId);
    const completed = dto.completed ?? false;
    const result = await this.views.recordHeartbeat({
      userId,
      contentId,
      viewId,
      watchedSeconds: dto.watchedSeconds,
      positionSeconds: dto.positionSeconds,
      completionPercent: dto.completionPercent ?? 0,
      completed,
      countMinSeconds: VIEW_COUNT_MIN_SECONDS,
      recountMinutes: VIEW_RECOUNT_MINUTES,
    });
    if (!result) {
      throw new NotFoundException('Viewing session not found');
    }
    const payload: WatchProgressPayload = { userId, contentId, dayWatchSeconds: result.dayWatchSeconds };
    const [today] = (await this.events.emitAsync(EngagementEvent.WatchProgress, payload)) as Array<StreakToday | undefined>;
    const progress = (await this.views.getProgress(userId, contentId)) ?? {
      lastPositionSeconds: dto.positionSeconds,
      isCompleted: completed,
      updatedAt: '',
    };
    return today ? { ...progress, today } : progress;
  }

  /** Resume point for a content (0 if never watched). */
  async progress(userId: string, contentId: string): Promise<ProgressRecord> {
    return (await this.views.getProgress(userId, contentId)) ?? {
      lastPositionSeconds: 0,
      isCompleted: false,
      updatedAt: '',
    };
  }

  /** Append a batch of watch events (analytics ingestion seam → Events module later). */
  async ingest(userId: string, contentId: string, dto: IngestWatchEventsDto): Promise<{ accepted: number }> {
    await this.access.assertPublished(contentId);
    const events: WatchEventInput[] = dto.events.map((e) => ({
      type: e.type,
      positionSeconds: e.positionSeconds,
      occurredAt: e.occurredAt,
    }));
    const accepted = await this.views.appendWatchEvents(userId, contentId, dto.viewId, events);
    return { accepted };
  }
}
