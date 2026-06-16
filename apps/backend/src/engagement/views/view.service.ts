import { Injectable } from '@nestjs/common';
import { ProgressRecord, ViewRepository, WatchEventInput } from '@db/repositories/engagement/view.repository';
import { ContentAccessService } from '../services/content-access.service';
import { HeartbeatDto, IngestWatchEventsDto, StartViewDto } from './dto/view.dto';

@Injectable()
export class ViewService {
  constructor(
    private readonly views: ViewRepository,
    private readonly access: ContentAccessService,
  ) {}

  /** Open a viewing session (bumps view_count via trigger). */
  async start(userId: string, contentId: string, dto: StartViewDto): Promise<{ viewId: string }> {
    await this.access.assertPublished(contentId);
    const viewId = await this.views.startView(userId, contentId, {
      ...(dto.sessionId ? { sessionId: dto.sessionId } : {}),
      ...(dto.device ? { device: dto.device } : {}),
    });
    return { viewId };
  }

  /** Heartbeat: update the session's metrics + the resume point. Idempotent-ish (monotonic). */
  async heartbeat(userId: string, contentId: string, viewId: string, dto: HeartbeatDto): Promise<ProgressRecord> {
    await this.access.assertPublished(contentId);
    const completed = dto.completed ?? false;
    await this.views.updateView(userId, viewId, {
      watchedSeconds: dto.watchedSeconds,
      positionSeconds: dto.positionSeconds,
      completionPercent: dto.completionPercent ?? 0,
      isCompleted: completed,
    });
    await this.views.upsertProgress(userId, contentId, dto.positionSeconds, completed);
    return (await this.views.getProgress(userId, contentId)) ?? {
      lastPositionSeconds: dto.positionSeconds,
      isCompleted: completed,
      updatedAt: '',
    };
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
