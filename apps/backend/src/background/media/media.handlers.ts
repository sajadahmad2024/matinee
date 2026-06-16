import { QueueHandler } from '@queue/consumer/queue-handler.decorator';
import { JobHandler, QueueMessage } from '@queue/interfaces/queue.interface';
import { JobName, QueueName } from '@queue/queue.constant';
import { MediaCleanupJob, TranscodePollJob, TranscodeVideoJob } from '@media/interfaces/media-jobs.interface';
import { Injectable } from '@nestjs/common';
import { MediaJobService } from './media-job.service';

@QueueHandler({ queue: QueueName.MEDIA, name: JobName.TRANSCODE_VIDEO })
@Injectable()
export class MediaTranscodeHandler implements JobHandler<TranscodeVideoJob> {
  constructor(private readonly jobs: MediaJobService) {}
  async handle(message: QueueMessage<TranscodeVideoJob>): Promise<void> {
    await this.jobs.runTranscode(message.body);
  }
}

@QueueHandler({ queue: QueueName.MEDIA, name: JobName.TRANSCODE_POLL })
@Injectable()
export class MediaTranscodePollHandler implements JobHandler<TranscodePollJob> {
  constructor(private readonly jobs: MediaJobService) {}
  async handle(message: QueueMessage<TranscodePollJob>): Promise<void> {
    await this.jobs.pollTranscode(message.body);
  }
}

@QueueHandler({ queue: QueueName.MEDIA, name: JobName.MEDIA_RECONCILE })
@Injectable()
export class MediaReconcileHandler implements JobHandler<unknown> {
  constructor(private readonly jobs: MediaJobService) {}
  async handle(_message: QueueMessage<unknown>): Promise<void> {
    await this.jobs.reconcileStuck();
  }
}

@QueueHandler({ queue: QueueName.MEDIA, name: JobName.MEDIA_ORPHAN_SWEEP })
@Injectable()
export class MediaOrphanSweepHandler implements JobHandler<unknown> {
  constructor(private readonly jobs: MediaJobService) {}
  async handle(_message: QueueMessage<unknown>): Promise<void> {
    await this.jobs.sweepOrphans();
  }
}

@QueueHandler({ queue: QueueName.MEDIA, name: JobName.MEDIA_CLEANUP })
@Injectable()
export class MediaCleanupHandler implements JobHandler<MediaCleanupJob> {
  constructor(private readonly jobs: MediaJobService) {}
  async handle(message: QueueMessage<MediaCleanupJob>): Promise<void> {
    await this.jobs.cleanup(message.body);
  }
}
