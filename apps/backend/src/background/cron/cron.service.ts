import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  async sendDailyMail(data?: unknown): Promise<void> {
    this.logger.debug(`Running daily mail job ${data ? JSON.stringify(data) : ''}`);
    // TODO: real daily digest logic
  }
}
