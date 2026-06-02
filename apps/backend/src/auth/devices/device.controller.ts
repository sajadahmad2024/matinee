import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerOrGuest } from '../decorators/account-type.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { MessageResponseDto } from '../dto/auth-responses.dto';
import { DeviceService } from './device.service';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { DeviceResponseDto } from './dto/device-response.dto';

@ApiTags('Devices')
@ApiBearerAuth()
@Controller({ path: RouteNames.DEVICES, version: '1' })
@CustomerOrGuest()
export class DeviceController {
  constructor(private readonly devices: DeviceService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register / refresh this device for push' })
  @ApiEnvelope(DeviceResponseDto)
  register(@CurrentUser('id') userId: string, @Body() dto: RegisterDeviceDto) {
    return this.devices.register(userId, {
      fcmToken: dto.fcmToken,
      platform: dto.platform,
      deviceId: dto.deviceId,
      appVersion: dto.appVersion,
      topics: dto.topics,
    });
  }

  @Delete(':fcmToken')
  @ApiOperation({ summary: 'Unregister a device' })
  @ApiEnvelope(MessageResponseDto)
  async remove(@CurrentUser('id') userId: string, @Param('fcmToken') fcmToken: string) {
    await this.devices.remove(userId, fcmToken);
    return { message: 'Device removed' };
  }
}
