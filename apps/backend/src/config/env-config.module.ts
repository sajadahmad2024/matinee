import { EnvConfig } from '@config/env.config';
import { Module } from '@nestjs/common';
import { ConfigModule, registerAs } from '@nestjs/config';
import * as Joi from 'joi';

const envConfig = registerAs(
  'env',
  () =>
    ({
      PORT: parseInt(process.env['PORT'] || '3000', 10),
      NODE_ENV: process.env['NODE_ENV'] || 'development',
      CORS_ORIGINS: process.env['CORS_ORIGINS'] || '*',
      PROMETHEUS_PORT: parseInt(process.env['PROMETHEUS_PORT'] || '9090', 10),
      PROMETHEUS_PUSH_GATEWAY_PORT: parseInt(
        process.env['PROMETHEUS_PUSH_GATEWAY_PORT'] || '9091',
        10
      ),
      PROMTAIL_PORT: parseInt(process.env['PROMTAIL_PORT'] || '9080', 10),
      NODE_EXPORTER_PORT: parseInt(process.env['NODE_EXPORTER_PORT'] || '9100', 10),
      NODE_EXPORTER_TARGET: process.env['NODE_EXPORTER_TARGET'] || '',
      NESTJS_METRICS_TARGET: process.env['NESTJS_METRICS_TARGET'] || '',
      GRAFANA_PORT: parseInt(process.env['GRAFANA_PORT'] || '3001', 10),
      GRAFANA_ADMIN_PASSWORD: process.env['GRAFANA_ADMIN_PASSWORD'] || '',
      LOKI_PORT: parseInt(process.env['LOKI_PORT'] || '3100', 10),
      LOKI_API_TOKEN: process.env['LOKI_API_TOKEN'] || '',
      OTLP_PORT: parseInt(process.env['OTLP_PORT'] || '4317', 10),
      OTEL_SERVICE_NAME: process.env['OTEL_SERVICE_NAME'] || '',
      OTEL_EXPORTER_OTLP_ENDPOINT: process.env['OTEL_EXPORTER_OTLP_ENDPOINT'] || '',
      JAEGER_PORT: parseInt(process.env['JAEGER_PORT'] || '16686', 10),
      JAEGER_COLLECTOR_PORT: parseInt(process.env['JAEGER_COLLECTOR_PORT'] || '14268', 10),
      JAGER_URL: process.env['JAGER_URL'] || '',
      REDIS_HOST: process.env['REDIS_HOST'] || '',
      REDIS_PORT: parseInt(process.env['REDIS_PORT'] || '6379', 10),
      REDIS_PASSWORD: process.env['REDIS_PASSWORD'] || '',
      REDIS_TLS_ENABLED: (process.env['REDIS_TLS_ENABLED'] || 'false').toLowerCase() === 'true',
      POSTGRES_DB: process.env['POSTGRES_DB'] || 'postgres',
      POSTGRES_USER: process.env['POSTGRES_USER'] || 'postgres',
      POSTGRES_PASSWORD: process.env['POSTGRES_PASSWORD'] || 'postgres',
      POSTGRES_HOST: process.env['POSTGRES_HOST'] || '127.0.0.1',
      POSTGRES_PORT: parseInt(process.env['POSTGRES_PORT'] || '5432', 10),
      DATABASE_URL: (() => {
        const dbUrl = process.env['DATABASE_URL'];
        // If DATABASE_URL contains template variables, construct it from individual components
        if (dbUrl && dbUrl.includes('${')) {
          return `postgresql://${process.env['POSTGRES_USER'] || 'postgres'}:${process.env['POSTGRES_PASSWORD'] || 'postgres'}@${process.env['POSTGRES_HOST'] || '127.0.0.1'}:${process.env['POSTGRES_PORT'] || '5432'}/${process.env['POSTGRES_DB'] || 'postgres'}`;
        }
        return (
          dbUrl ||
          `postgresql://${process.env['POSTGRES_USER'] || 'postgres'}:${process.env['POSTGRES_PASSWORD'] || 'postgres'}@${process.env['POSTGRES_HOST'] || '127.0.0.1'}:${process.env['POSTGRES_PORT'] || '5432'}/${process.env['POSTGRES_DB'] || 'postgres'}`
        );
      })(),
      DEFAULT_PAGE: parseInt(process.env['DEFAULT_PAGE'] || '1', 10),
      DEFAULT_PAGE_SIZE: parseInt(process.env['DEFAULT_PAGE_SIZE'] || '10', 10),
      GRAFANA_URL: process.env['GRAFANA_URL'] || '',
      APP_LOGS_URL: process.env['APP_LOGS_URL'] || '',
      DEV_DOCS_URL: process.env['DEV_DOCS_URL'] || '',
      SERVICES_HEALTH_URL: process.env['SERVICES_HEALTH_URL'] || '',
      // Queue (SQS / ElasticMQ)
      QUEUE_DRIVER: process.env['QUEUE_DRIVER'] || 'sqs',
      SQS_ENDPOINT: process.env['SQS_ENDPOINT'] || '',
      SQS_REGION: process.env['SQS_REGION'] || 'us-east-1',
      SQS_ACCESS_KEY_ID: process.env['SQS_ACCESS_KEY_ID'] || '',
      SQS_SECRET_ACCESS_KEY: process.env['SQS_SECRET_ACCESS_KEY'] || '',
      SQS_QUEUE_PREFIX: process.env['SQS_QUEUE_PREFIX'] || '',
      QUEUE_VISIBILITY_TIMEOUT: parseInt(process.env['QUEUE_VISIBILITY_TIMEOUT'] || '30', 10),
      QUEUE_WAIT_TIME_SECONDS: parseInt(process.env['QUEUE_WAIT_TIME_SECONDS'] || '20', 10),
      QUEUE_MAX_RECEIVE_COUNT: parseInt(process.env['QUEUE_MAX_RECEIVE_COUNT'] || '5', 10),
      QUEUE_BATCH_SIZE: parseInt(process.env['QUEUE_BATCH_SIZE'] || '10', 10),
      QUEUE_CONSUMER_ENABLED: (process.env['QUEUE_CONSUMER_ENABLED'] || 'true').toLowerCase() === 'true',
      QUEUE_AUTO_CREATE: (process.env['QUEUE_AUTO_CREATE'] || 'true').toLowerCase() === 'true',
      // Cache (Redis / ElastiCache)
      CACHE_KEY_PREFIX: process.env['CACHE_KEY_PREFIX'] || 'app',
      CACHE_DEFAULT_TTL: parseInt(process.env['CACHE_DEFAULT_TTL'] || '300', 10),
      CACHE_CLUSTER_ENABLED: (process.env['CACHE_CLUSTER_ENABLED'] || 'false').toLowerCase() === 'true',
      // Auth / JWT / Cookies
      JWT_ACCESS_TTL: parseInt(process.env['JWT_ACCESS_TTL'] || '900', 10),
      JWT_REFRESH_TTL: parseInt(process.env['JWT_REFRESH_TTL'] || '5184000', 10),
      JWT_ADMIN_REFRESH_TTL: parseInt(process.env['JWT_ADMIN_REFRESH_TTL'] || '43200', 10),
      JWT_REMEMBER_TTL: parseInt(process.env['JWT_REMEMBER_TTL'] || '2592000', 10),
      JWT_RENEW_WINDOW: parseInt(process.env['JWT_RENEW_WINDOW'] || '300', 10),
      COOKIE_DOMAIN: process.env['COOKIE_DOMAIN'] || 'localhost',
      COOKIE_SECURE: (process.env['COOKIE_SECURE'] || 'false').toLowerCase() === 'true',
      CSRF_ENABLED: (process.env['CSRF_ENABLED'] || 'false').toLowerCase() === 'true',
      PHONE_VERIFICATION_PROVIDER: process.env['PHONE_VERIFICATION_PROVIDER'] || 'twilio',
      APPLE_CLIENT_ID: process.env['APPLE_CLIENT_ID'] || '',
    }) as EnvConfig
);

const validationSchema = Joi.object({
  PORT: Joi.number().port().required(),
  NODE_ENV: Joi.string().valid('development', 'production').required(),
  CORS_ORIGINS: Joi.string().required().disallow(null, ''),
  PROMETHEUS_PORT: Joi.number().port().allow(null, 9090),
  PROMETHEUS_PUSH_GATEWAY_PORT: Joi.number().port().allow(null, 9091),
  PROMTAIL_PORT: Joi.number().port().allow(null, 9080),
  NODE_EXPORTER_PORT: Joi.number().port().allow(null, 9100),
  NODE_EXPORTER_TARGET: Joi.string().allow(null, '127.0.0.1:3000'),
  NESTJS_METRICS_TARGET: Joi.string().allow(null, 'node-exporter:9100'),
  GRAFANA_PORT: Joi.number().port().allow(null),
  GRAFANA_ADMIN_PASSWORD: Joi.string().allow(null, ''),
  LOKI_PORT: Joi.when('NODE_ENV', {
    is: 'development',
    then: Joi.number().port().required(),
    otherwise: Joi.number().port().allow(null),
  }),
  LOKI_API_TOKEN: Joi.when('NODE_ENV', {
    is: 'development',
    then: Joi.string().required(),
    otherwise: Joi.string().allow(null, ''),
  }),
  OTLP_PORT: Joi.number().port().allow(null, 4318),
  OTEL_SERVICE_NAME: Joi.string().required(),
  OTEL_EXPORTER_OTLP_ENDPOINT: Joi.string().uri().required(),
  JAEGER_PORT: Joi.number().port().allow(null, 16686),
  JAEGER_COLLECTOR_PORT: Joi.number().port().allow(null, 14268),
  JAGER_URL: Joi.string().uri().allow(null, 'http://localhost:16686'),
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().port().required(),
  REDIS_PASSWORD: Joi.string().required(),
  REDIS_TLS_ENABLED: Joi.boolean().default(false),
  POSTGRES_DB: Joi.string().required(),
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_HOST: Joi.string().required(),
  POSTGRES_PORT: Joi.number().port().required(),
  // Regex validation for PostgreSQL connection string
  DATABASE_URL: Joi.string()
    .required()
    .pattern(/^postgresql:\/\//)
    .messages({
      'string.pattern.base': 'DATABASE_URL must start with "postgresql://"',
      'string.empty': 'DATABASE_URL is required',
    }),
  DEFAULT_PAGE: Joi.number().default(1),
  DEFAULT_PAGE_SIZE: Joi.number().default(10),
  GRAFANA_URL: Joi.string().required(),
  APP_LOGS_URL: Joi.string().required(),
  DEV_DOCS_URL: Joi.string().required(),
  SERVICES_HEALTH_URL: Joi.string().required(),
  // Queue (SQS everywhere) — Joi coerces strings to numbers/booleans for flat get().
  // Local uses ElasticMQ via SQS_ENDPOINT; prod uses real AWS SQS (empty SQS_ENDPOINT). Same driver.
  QUEUE_DRIVER: Joi.string().valid('sqs').default('sqs'),
  SQS_ENDPOINT: Joi.string().allow('').default(''),
  SQS_PORT: Joi.number().default(9326),
  SQS_REGION: Joi.string().default('us-east-1'),
  SQS_ACCESS_KEY_ID: Joi.string().allow('').default(''),
  SQS_SECRET_ACCESS_KEY: Joi.string().allow('').default(''),
  SQS_QUEUE_PREFIX: Joi.string().allow('').default(''),
  QUEUE_VISIBILITY_TIMEOUT: Joi.number().default(30),
  QUEUE_WAIT_TIME_SECONDS: Joi.number().default(20),
  QUEUE_MAX_RECEIVE_COUNT: Joi.number().default(5),
  QUEUE_BATCH_SIZE: Joi.number().default(10),
  QUEUE_CONSUMER_ENABLED: Joi.boolean().default(false),
  QUEUE_AUTO_CREATE: Joi.boolean().default(true),
  // Cache (Redis / ElastiCache)
  CACHE_KEY_PREFIX: Joi.string().default('app'),
  CACHE_DEFAULT_TTL: Joi.number().default(300),
  CACHE_CLUSTER_ENABLED: Joi.boolean().default(false),
  // Auth / JWT / Cookies
  JWT_ACCESS_TTL: Joi.number().default(900),
  JWT_REFRESH_TTL: Joi.number().default(5184000),
  JWT_ADMIN_REFRESH_TTL: Joi.number().default(43200),
  JWT_REMEMBER_TTL: Joi.number().default(2592000),
  JWT_RENEW_WINDOW: Joi.number().default(300),
  COOKIE_DOMAIN: Joi.string().default('localhost'),
  COOKIE_SECURE: Joi.boolean().default(false),
  CSRF_ENABLED: Joi.boolean().default(false),
  PHONE_VERIFICATION_PROVIDER: Joi.string().valid('twilio', 'firebase').default('twilio'),
  APPLE_CLIENT_ID: Joi.string().allow('').default(''),
  // Email provider (env-driven strategy: smtp / ses / sendgrid / log [dev — logs + stashes code])
  EMAIL_PROVIDER: Joi.string().valid('smtp', 'ses', 'sendgrid', 'log').default('smtp'),
  EMAIL_FROM: Joi.string().allow('').default('noreply@example.com'),
  SENDGRID_API_KEY: Joi.string().allow('').default(''),
  SENDGRID_SMTP_HOST: Joi.string().allow('').default('smtp.sendgrid.net'),
  SENDGRID_SMTP_PORT: Joi.number().port().default(587),
  // SMS provider (env-driven strategy: twilio / sns / log [dev — logs + stashes code])
  SMS_PROVIDER: Joi.string().valid('twilio', 'sns', 'log').default('twilio'),
  // Media (storage / delivery / transcode) — coerced for flat get()
  MEDIA_STORAGE_DRIVER: Joi.string().valid('s3', 'local').default('local'),
  MEDIA_DELIVERY_DRIVER: Joi.string().valid('cloudfront', 'local').default('local'),
  MEDIA_TRANSCODER: Joi.string().valid('mediaconvert', 'local').default('local'),
  MEDIA_S3_BUCKET: Joi.string().allow('').default(''),
  MEDIA_S3_REGION: Joi.string().allow('').default('us-east-1'),
  MEDIA_S3_ENDPOINT: Joi.string().allow('').default(''),
  MEDIA_S3_ACCESS_KEY_ID: Joi.string().allow('').default(''),
  MEDIA_S3_SECRET_ACCESS_KEY: Joi.string().allow('').default(''),
  MEDIA_OUTPUT_BUCKET: Joi.string().allow('').default(''),
  MEDIA_CDN_URL: Joi.string().allow('').default(''),
  MEDIA_CDN_KEY_PAIR_ID: Joi.string().allow('').default(''),
  MEDIA_CDN_PRIVATE_KEY: Joi.string().allow('').default(''),
  MEDIA_PUBLIC_BASE_URL: Joi.string().allow('').default('http://localhost:3000'),
  MEDIA_MEDIACONVERT_ENDPOINT: Joi.string().allow('').default(''),
  MEDIA_MEDIACONVERT_ROLE_ARN: Joi.string().allow('').default(''),
  MEDIA_MEDIACONVERT_QUEUE: Joi.string().allow('').default(''),
  MEDIA_UPLOAD_URL_TTL: Joi.number().default(900),
  MEDIA_SIGNED_URL_TTL: Joi.number().default(900),
  MEDIA_MAX_UPLOAD_BYTES: Joi.number().default(10737418240),
  MEDIA_TRANSCODE_POLL_INTERVAL: Joi.number().default(15),
  MEDIA_TRANSCODE_POLL_MAX_INTERVAL: Joi.number().default(120),
  MEDIA_TRANSCODE_STUCK_SECONDS: Joi.number().default(300),
  MEDIA_TRANSCODE_MAX_SECONDS: Joi.number().default(21600),
  MEDIA_ORPHAN_AGE_SECONDS: Joi.number().default(86400),
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
      validationSchema,
    }),
  ],
  exports: [ConfigModule],
})
export class EnvConfigModule {}
