import { EnvConfigModule } from '@config/env-config.module';
import { DBModule } from '@db/db.module';
import { HealthModule } from '@health/health.module';
import { HttpLoggingInterceptor } from '@interceptors/logging.interceptor';
import { TransformInterceptor } from '@interceptors/transform.interceptor';
import { LoggerModule } from '@logger/logger.module';
import { MetricsModule } from '@metrics/metrics.module';
import { MetricsMiddleware } from '@middlewares/metrics.middleware';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { RedisModule } from '@redis/redis.module';
import { ErrorHandlerService } from '@common/services/error-handler.service';
import { DevToolsModule } from './api/dev-tools/dev-tools.module';
import { OtelModule } from '@otel/otel.module';
import { TracingModule } from './api/tracing/tracing.module';
import { DevToolsMiddleware } from '@middlewares/dev-tool.middleware';
import { RouteNames } from '@common/route-names';

// Infrastructure modules (env-driven: local vs cloud with no code change)
import { CacheModule } from '@cache/cache.module';
import { QueueModule } from '@queue/queue.module';

// Auth
import { AuthModule } from './auth/auth.module';

// Media (independent asset registry + secure upload/delivery)
import { MediaModule } from './media/media.module';

// SMS / Email (needed for OTP delivery)
import { SmsModule } from './sms/sms.module';
import { EmailModule } from '@email/email.module';

// Global auth guards + sliding-renewal interceptor (deps resolved from AuthModule exports)
import { AuthGuard } from './auth/guards/auth.guard';
import { AccountTypeGuard } from './auth/guards/account-type.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { PermissionsGuard } from './auth/guards/permissions.guard';
import { CsrfGuard } from './auth/guards/csrf.guard';
import { TokenRenewalInterceptor } from './auth/interceptors/token-renewal.interceptor';

// Rate Limiting
// NOTE: @nestjs/throttler v6 expresses `ttl` in MILLISECONDS. (Using seconds here would
// make every window ~tens of ms and effectively disable rate limiting.)
const rateLimit = ThrottlerModule.forRoot([
  { name: 'short', ttl: 60_000, limit: 30 }, // 30 req / minute
  { name: 'medium', ttl: 5 * 60_000, limit: 100 }, // 100 req / 5 min
  { name: 'long', ttl: 30 * 60_000, limit: 500 }, // 500 req / 30 min
  { name: 'very-long', ttl: 60 * 60_000, limit: 1000 }, // 1000 req / hour
]);

@Module({
  imports: [
    rateLimit,
    EnvConfigModule,
    LoggerModule,
    EventEmitterModule.forRoot(),
    RedisModule,
    CacheModule,
    QueueModule,
    DBModule,
    OtelModule,

    // Auth
    AuthModule,

    // Media
    MediaModule,

    // SMS / Email
    SmsModule,
    EmailModule,

    // APIs / Observability
    MetricsModule,
    HealthModule,
    DevToolsModule,
    TracingModule,
  ],
  providers: [
    ErrorHandlerService,
    DevToolsMiddleware,
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpLoggingInterceptor,
    },
    // Guard order: ThrottlerGuard → AuthGuard → AccountTypeGuard → RolesGuard → PermissionsGuard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AccountTypeGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
    // Sliding token renewal must run before the response is serialized.
    {
      provide: APP_INTERCEPTOR,
      useClass: TokenRenewalInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MetricsMiddleware).forRoutes('*');
    consumer
      .apply(DevToolsMiddleware)
      .forRoutes(
        RouteNames.DEV_TOOLS,
        `${RouteNames.HEALTH}/${RouteNames.HEALTH_UI}`,
        RouteNames.API_DOCS,
      );
  }
}
