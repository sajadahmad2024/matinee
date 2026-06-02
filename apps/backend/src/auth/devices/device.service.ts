import { DBService } from '@db/db.service';
import { DeviceRepository } from '@db/repositories/auth/device.repository';
import { ForbiddenException, Injectable } from '@nestjs/common';

export interface DeviceDto {
  id: string;
  platform: string;
  topics: string[];
}

@Injectable()
export class DeviceService {
  constructor(
    private readonly db: DBService,
    private readonly devices: DeviceRepository,
  ) {}

  async register(
    userId: string,
    input: { fcmToken: string; platform: string; deviceId?: string | undefined; appVersion?: string | undefined; topics?: string[] | undefined },
  ): Promise<DeviceDto> {
    const { id, platform, topics } = await this.db.transaction(async (tx) => {
      // Ownership guard (anti-IDOR): an fcm_token already bound to a DIFFERENT real
      // (non-guest) account cannot be silently reassigned. Self re-registration and
      // claiming a guest's token (e.g. just before a guest→customer merge) are allowed —
      // only a guest's token can legitimately move to its merge target.
      const owner = await this.devices.findOwner(input.fcmToken, tx);
      if (owner && owner.userId !== userId && owner.accountType !== 'guest') {
        throw new ForbiddenException('This device is registered to another account');
      }
      const device = await this.devices.upsert(
        { userId, fcmToken: input.fcmToken, platform: input.platform, deviceId: input.deviceId, appVersion: input.appVersion },
        tx,
      );
      if (input.topics) {
        await this.devices.setTopics(device.id, input.topics, tx);
      }
      return { id: device.id, platform: device.platform, topics: await this.devices.getTopics(device.id, tx) };
    });
    return { id, platform, topics };
  }

  async remove(userId: string, fcmToken: string): Promise<void> {
    await this.devices.removeByFcm(userId, fcmToken);
  }
}
