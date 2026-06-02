import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class EnvConfig {
  @IsNotEmpty()
  @IsNumber()
  PORT!: number;

  @IsNotEmpty()
  @IsString()
  NODE_ENV!: string;

  @IsNotEmpty()
  @IsString()
  CORS_ORIGINS!: string;

  @IsNotEmpty()
  @IsNumber()
  PROMETHEUS_PORT!: number;

  @IsNotEmpty()
  @IsNumber()
  PROMETHEUS_PUSH_GATEWAY_PORT!: number;

  @IsNotEmpty()
  @IsNumber()
  PROMTAIL_PORT!: number;

  @IsNotEmpty()
  @IsNumber()
  NODE_EXPORTER_PORT!: number;

  @IsNotEmpty()
  @IsString()
  NESTJS_METRICS_TARGET!: string;

  @IsNotEmpty()
  @IsString()
  NODE_EXPORTER_TARGET!: string;

  @IsNotEmpty()
  @IsNumber()
  GRAFANA_PORT!: number;

  @IsNotEmpty()
  @IsString()
  GRAFANA_ADMIN_PASSWORD!: string;

  @IsNotEmpty()
  @IsNumber()
  LOKI_PORT!: number;

  @IsNotEmpty()
  @IsString()
  LOKI_API_TOKEN!: string;

  @IsNotEmpty()
  @IsNumber()
  OTLP_PORT!: number;

  @IsNotEmpty()
  @IsString()
  OTEL_SERVICE_NAME!: string;

  @IsNotEmpty()
  @IsString()
  OTEL_EXPORTER_OTLP_ENDPOINT!: string;

  @IsNotEmpty()
  @IsNumber()
  JAEGER_PORT!: number;

  @IsNotEmpty()
  @IsNumber()
  JAEGER_COLLECTOR_PORT!: number;

  @IsNotEmpty()
  @IsString()
  JAGER_URL!: string;

  @IsNotEmpty()
  @IsString()
  REDIS_HOST!: string;

  @IsNotEmpty()
  @IsNumber()
  REDIS_PORT!: number;

  @IsNotEmpty()
  @IsString()
  REDIS_PASSWORD!: string;

  @IsNotEmpty()
  @IsBoolean()
  REDIS_TLS_ENABLED!: boolean;

  @IsNotEmpty()
  @IsString()
  POSTGRES_DB!: string;

  @IsNotEmpty()
  @IsString()
  POSTGRES_USER!: string;

  @IsNotEmpty()
  @IsString()
  POSTGRES_PASSWORD!: string;

  @IsNotEmpty()
  @IsString()
  POSTGRES_HOST!: string;

  @IsNotEmpty()
  @IsNumber()
  POSTGRES_PORT!: number;

  @IsNotEmpty()
  @IsString()
  DATABASE_URL!: string;

  @IsNotEmpty()
  @IsNumber()
  DEFAULT_PAGE!: number;

  @IsNotEmpty()
  @IsNumber()
  DEFAULT_PAGE_SIZE!: number;

  @IsNotEmpty()
  @IsString()
  GRAFANA_URL!: string;

  @IsNotEmpty()
  @IsString()
  APP_LOGS_URL!: string;

  @IsNotEmpty()
  @IsString()
  DEV_DOCS_URL!: string;

  @IsNotEmpty()
  @IsString()
  SERVICES_HEALTH_URL!: string;

  // ─── JWT ────────────────────────────────────────────────────────────────────

  @IsNotEmpty()
  @IsString()
  JWT_SECRET!: string;

  @IsOptional()
  @IsString()
  JWT_REFRESH_SECRET?: string;

  // ─── Google OAuth ───────────────────────────────────────────────────────────

  @IsOptional()
  @IsString()
  GOOGLE_CLIENT_ID?: string;

  @IsOptional()
  @IsString()
  GOOGLE_CLIENT_SECRET?: string;

  @IsOptional()
  @IsString()
  GOOGLE_CALLBACK_URL?: string;

  // ─── GitHub OAuth ───────────────────────────────────────────────────────────

  @IsOptional()
  @IsString()
  GITHUB_CLIENT_ID?: string;

  @IsOptional()
  @IsString()
  GITHUB_CLIENT_SECRET?: string;

  @IsOptional()
  @IsString()
  GITHUB_CALLBACK_URL?: string;

  // ─── SMS (Twilio) ──────────────────────────────────────────────────────────

  @IsOptional()
  @IsString()
  SMS_PROVIDER?: string;

  @IsOptional()
  @IsString()
  TWILIO_ACCOUNT_SID?: string;

  @IsOptional()
  @IsString()
  TWILIO_AUTH_TOKEN?: string;

  @IsOptional()
  @IsString()
  TWILIO_PHONE_NUMBER?: string;

  // ─── SMS (AWS SNS) ─────────────────────────────────────────────────────────

  @IsOptional()
  @IsString()
  AWS_REGION?: string;

  @IsOptional()
  @IsString()
  AWS_ACCESS_KEY_ID?: string;

  @IsOptional()
  @IsString()
  AWS_SECRET_ACCESS_KEY?: string;

  @IsOptional()
  @IsString()
  AWS_SNS_SENDER_ID?: string;

  // ─── FCM (Firebase Cloud Messaging) ──────────────────────────────────────

  @IsOptional()
  @IsString()
  FCM_PROJECT_ID?: string;

  @IsOptional()
  @IsString()
  FCM_PRIVATE_KEY?: string;

  @IsOptional()
  @IsString()
  FCM_CLIENT_EMAIL?: string;

  // ─── AI / OpenAI ──────────────────────────────────────────────────────────

  @IsOptional()
  @IsString()
  OPENAI_API_KEY?: string;

  @IsOptional()
  @IsString()
  OPENAI_BASE_URL?: string;

  @IsOptional()
  @IsString()
  OPENAI_DEFAULT_MODEL?: string;

  @IsOptional()
  @IsString()
  OPENAI_EMBEDDING_MODEL?: string;

  @IsOptional()
  @IsString()
  AI_DEFAULT_PROVIDER?: string;

  // ─── Agent Tools ────────────────────────────────────────────────────────

  @IsOptional()
  @IsString()
  AGENT_API_ALLOWED_DOMAINS?: string;

  // ─── Queue (SQS / ElasticMQ) ───────────────────────────────────────────────

  @IsOptional()
  @IsString()
  QUEUE_DRIVER?: string;

  @IsOptional()
  @IsString()
  SQS_ENDPOINT?: string;

  @IsOptional()
  @IsString()
  SQS_REGION?: string;

  @IsOptional()
  @IsString()
  SQS_ACCESS_KEY_ID?: string;

  @IsOptional()
  @IsString()
  SQS_SECRET_ACCESS_KEY?: string;

  @IsOptional()
  @IsString()
  SQS_QUEUE_PREFIX?: string;

  @IsOptional()
  @IsNumber()
  QUEUE_VISIBILITY_TIMEOUT?: number;

  @IsOptional()
  @IsNumber()
  QUEUE_WAIT_TIME_SECONDS?: number;

  @IsOptional()
  @IsNumber()
  QUEUE_MAX_RECEIVE_COUNT?: number;

  @IsOptional()
  @IsNumber()
  QUEUE_BATCH_SIZE?: number;

  @IsOptional()
  @IsBoolean()
  QUEUE_CONSUMER_ENABLED?: boolean;

  @IsOptional()
  @IsBoolean()
  QUEUE_AUTO_CREATE?: boolean;

  // ─── Cache (Redis / ElastiCache) ───────────────────────────────────────────

  @IsOptional()
  @IsString()
  CACHE_KEY_PREFIX?: string;

  @IsOptional()
  @IsNumber()
  CACHE_DEFAULT_TTL?: number;

  @IsOptional()
  @IsBoolean()
  CACHE_CLUSTER_ENABLED?: boolean;

  // ─── Auth / JWT / Cookies ──────────────────────────────────────────────────

  @IsOptional()
  @IsNumber()
  JWT_ACCESS_TTL?: number;

  @IsOptional()
  @IsNumber()
  JWT_REFRESH_TTL?: number;

  @IsOptional()
  @IsNumber()
  JWT_ADMIN_REFRESH_TTL?: number;

  @IsOptional()
  @IsNumber()
  JWT_REMEMBER_TTL?: number;

  @IsOptional()
  @IsNumber()
  JWT_RENEW_WINDOW?: number;

  @IsOptional()
  @IsString()
  COOKIE_DOMAIN?: string;

  @IsOptional()
  @IsBoolean()
  COOKIE_SECURE?: boolean;

  @IsOptional()
  @IsBoolean()
  CSRF_ENABLED?: boolean;

  @IsOptional()
  @IsString()
  PHONE_VERIFICATION_PROVIDER?: string;

  // ─── Social OAuth (Google / Apple — redirect flow) ─────────────────────────

  @IsOptional()
  @IsString()
  APPLE_CLIENT_ID?: string;

  @IsOptional()
  @IsString()
  APPLE_TEAM_ID?: string;

  @IsOptional()
  @IsString()
  APPLE_KEY_ID?: string;

  @IsOptional()
  @IsString()
  APPLE_PRIVATE_KEY?: string;

  @IsOptional()
  @IsString()
  APPLE_CALLBACK_URL?: string;

  @IsOptional()
  @IsString()
  OAUTH_SUCCESS_REDIRECT?: string;

  @IsOptional()
  @IsString()
  OAUTH_ALLOWED_REDIRECTS?: string;
}
