import { RouteNames } from '@common/route-names';
import { EnvConfig } from '@config/env.config';
import { Public } from '@auth/decorators/public.decorator';
import { CacheService } from '@cache/cache.service';
import { Controller, Get, NotFoundException, Query, Res, VERSION_NEUTRAL } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeController, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@Controller({path: RouteNames.DEV_TOOLS, version: VERSION_NEUTRAL})
@ApiTags('Dev Tools')
@ApiExcludeController()
@Public()
export class DevToolsController {
  private readonly jaegerUrl;
  private readonly grafanaUrl;
  private readonly appLogsUrl;
  private readonly apiDocsUrl;
  private readonly devDocsUrl;
  private readonly bullBoardUrl;
  private readonly systemHealthUrl;

  constructor(
    private readonly configService: ConfigService<EnvConfig>,
    private readonly cache: CacheService,
  ) {
    this.grafanaUrl = this.configService.get('GRAFANA_URL') || 'http://localhost:3001';
    this.appLogsUrl = this.configService.get('APP_LOGS_URL') || 'https://localhost:3000';
    this.devDocsUrl = this.configService.get('DEV_DOCS_URL') || 'https://localhost:3100';
    this.systemHealthUrl = this.configService.get('SERVICES_HEALTH_URL') || `/${RouteNames.HEALTH}/${RouteNames.HEALTH_UI}`;
    this.jaegerUrl = this.configService.get('JAGER_URL') || 'http://localhost:16686';
    this.apiDocsUrl = `/${RouteNames.API_DOCS}`;
    this.bullBoardUrl = `/${RouteNames.QUEUES_UI}`;
  }

  @Get()
  showTools(@Res() res: Response) {
    const tools = [
      { name: 'Grafana', url: this.grafanaUrl, icon: 'grafana.png' },
      { name: 'Jaeger', url: this.jaegerUrl, icon: 'jaeger.png' },
      {
        name: 'Application Logs',
        url: this.appLogsUrl,
        icon: 'logs.png',
      },
      { name: 'System Health', url: this.systemHealthUrl, icon: 'health.png' },
      { name: 'Dev Docs', url: this.devDocsUrl, icon: 'docs.png' },
      { name: 'API Docs', url: this.apiDocsUrl, icon: 'swagger.png' },
      { name: 'Bull Board', url: this.bullBoardUrl, icon: 'bull.png' },
    ];

    res.render('dev-tools', {
      title: 'Dev Tools',
      tools,
      user: 'Developer',
    });
  }

  /**
   * DEV-ONLY: fetch the last verification code captured by the `log` SMS/email providers for a
   * destination (phone or email). Returns null if none/expired. 404 in production.
   *
   *   GET /dev-tools/otp?dest=+15551234567            (sms — default)
   *   GET /dev-tools/otp?dest=admin@example.com&channel=email
   */
  @Get('otp')
  async lastOtp(@Query('dest') dest: string, @Query('channel') channel?: string) {
    if (this.configService.get('NODE_ENV') === 'production') {
      throw new NotFoundException();
    }
    const ch = channel === 'email' ? 'email' : 'sms';
    // A raw '+' in the query string decodes to a space; phone numbers have none, so restore it.
    const normalized = (dest ?? '').replace(/ /g, '+');
    const code = normalized ? await this.cache.get<string>(`dev:otp:${ch}:${normalized}`) : null;
    return { dest: normalized, channel: ch, code: code ?? null };
  }
}
