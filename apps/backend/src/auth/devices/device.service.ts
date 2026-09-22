import { DeviceListItem, DeviceRepository } from '@db/repositories/auth/device.repository';
import { ForbiddenException, Injectable } from '@nestjs/common';

export interface DeviceDto {
  id: string;
  platform: string;
}

/**
 * Device registration (FCM token upsert) — server-side.
 * Topic subscription is client-managed via FirebaseMessaging.subscribeToTopic; the backend
 * does not track or manage per-device topic membership.
 */
@Injectable()
export class DeviceService {
  constructor(private readonly devices: DeviceRepository) {}

  async register(
    userId: string,
    input: { fcmToken: string; platform: string; deviceId?: string | undefined; appVersion?: string | undefined },
  ): Promise<DeviceDto> {
    // Ownership guard (anti-IDOR): an fcm_token already bound to a DIFFERENT real
    // (non-guest) account cannot be silently reassigned. Self re-registration and
    // claiming a guest's token (e.g. just before a guest→customer merge) are allowed —
    // only a guest's token can legitimately move to its merge target.
    const owner = await this.devices.findOwner(input.fcmToken);
    if (owner && owner.userId !== userId && owner.accountType !== 'guest') {
      throw new ForbiddenException('This device is registered to another account');
    }
    const device = await this.devices.upsert({
      userId,
      fcmToken: input.fcmToken,
      platform: input.platform,
      deviceId: input.deviceId,
      appVersion: input.appVersion,
    });
    return { id: device.id, platform: device.platform };
  }

  list(userId: string): Promise<DeviceListItem[]> {
    return this.devices.listByUser(userId);
  }

  async remove(userId: string, fcmToken: string): Promise<void> {
    await this.devices.removeByFcm(userId, fcmToken);
  }
}
