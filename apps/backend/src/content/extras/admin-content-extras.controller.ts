import { RouteNames } from '@common/route-names';
import { Body, Controller, Get, Param, ParseUUIDPipe, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { AdminOnly } from '../../auth/decorators/account-type.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { ContentExtrasService } from './content-extras.service';
import { LicenseDto, SetRegionsDto, SponsorshipDto } from './dto/content-extras.dto';
import {
  ContentHistoryEntryDto,
  LicenseResponseDto,
  RegionsResponseDto,
  SponsorshipResponseDto,
} from './dto/content-extras-response.dto';

/** Admin content-item extras: licensing, sponsorship, publish-regions, workflow history. */
@ApiTags('Admin · Content')
@ApiBearerAuth()
@AdminOnly()
@Controller({ path: `${RouteNames.ADMIN}/content`, version: '1' })
export class AdminContentExtrasController {
  constructor(private readonly extras: ContentExtrasService) {}

  // Licensing
  @Get(':id/license') @Permissions('content:read') @ApiOperation({ summary: 'Get active license' }) @ApiEnvelope(LicenseResponseDto)
  getLicense(@Param('id', ParseUUIDPipe) id: string) { return this.extras.getLicense(id); }
  @Put(':id/license') @Permissions('content:write') @ApiOperation({ summary: 'Set / renew license' }) @ApiEnvelope(LicenseResponseDto)
  setLicense(@CurrentUser('id') adminId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: LicenseDto) {
    return this.extras.setLicense(adminId, id, dto);
  }

  // Sponsorship / ad-sales
  @Get(':id/sponsorship') @Permissions('content:read') @ApiOperation({ summary: 'Get active sponsorship/commercial' }) @ApiEnvelope(SponsorshipResponseDto)
  getSponsorship(@Param('id', ParseUUIDPipe) id: string) { return this.extras.getSponsorship(id); }
  @Put(':id/sponsorship') @Permissions('content:write') @ApiOperation({ summary: 'Set sponsorship / ad-commercial' }) @ApiEnvelope(SponsorshipResponseDto)
  setSponsorship(@CurrentUser('id') adminId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: SponsorshipDto) {
    return this.extras.setSponsorship(adminId, id, dto);
  }

  // Publish regions (availability)
  @Get(':id/regions') @Permissions('content:read') @ApiOperation({ summary: 'Get publish regions' }) @ApiEnvelope(RegionsResponseDto)
  getRegions(@Param('id', ParseUUIDPipe) id: string) { return this.extras.getRegions(id); }
  @Put(':id/regions') @Permissions('content:write') @ApiOperation({ summary: 'Set publish regions (availability)' }) @ApiEnvelope(RegionsResponseDto)
  setRegions(@CurrentUser('id') adminId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: SetRegionsDto) {
    return this.extras.setRegions(adminId, id, dto);
  }

  // Workflow history
  @Get(':id/history') @Permissions('content:read') @ApiOperation({ summary: 'Workflow / change history (newest first)' }) @ApiEnvelope(ContentHistoryEntryDto, { isArray: true })
  history(@Param('id', ParseUUIDPipe) id: string) { return this.extras.getHistory(id); }
}
