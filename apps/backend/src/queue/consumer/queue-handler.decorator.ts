import { SetMetadata } from '@nestjs/common';
import { JobName, QUEUE_HANDLER_METADATA, QueueName } from '../queue.constant';

/**
 * Marks a provider class as the handler for `name` messages on `queue`.
 * The worker's QueueConsumerService discovers these at boot and dispatches to them.
 *
 *   @QueueHandler({ queue: QueueName.EMAIL, name: JobName.OTP_EMAIL })
 *   export class EmailOtpHandler implements JobHandler<IOtpEmailJob> { ... }
 */
export const QueueHandler = (meta: { queue: QueueName; name: JobName | string }) =>
  SetMetadata(QUEUE_HANDLER_METADATA, { queue: meta.queue, name: String(meta.name) });
