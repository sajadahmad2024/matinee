import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { createStandaloneConfigService } from '@config/deployment-target.util';
import type { EnvConfig } from '@config/env.config';

/**
 * Runs before `AppModule`/`WorkerModule` are ever `require()`'d (see `src/main.ts` /
 * `src/worker.main.ts`). `app.module.ts` constructs a `new ConfigService()` at module-evaluation
 * time, so `process.env` must already be fully populated by the time that `require()` happens —
 * a dynamic `import()` gate is what makes that ordering possible under CommonJS.
 *
 * No-op unless `DEPLOYMENT_TARGET=aws`. Under Floci (local) or real AWS, fetches the single JSON
 * secret named by `SECRETS_MANAGER_SECRET_ID` (defaults to `<app>/<env>`) and copies every key
 * into `process.env` — from that point on, `ConfigService.get(...)` returns those values with no
 * downstream code change required.
 */
export async function hydrateSecretsIfNeeded(): Promise<void> {
  const configService = createStandaloneConfigService();

  if (configService.get<string>('DEPLOYMENT_TARGET' as keyof EnvConfig) !== 'aws') {
    return;
  }

  const secretId =
    configService.get<string>('SECRETS_MANAGER_SECRET_ID' as keyof EnvConfig) ??
    `maintinee/${configService.get<string>('NODE_ENV') ?? 'development'}`;
  const endpoint = configService.get<string>('FLOCI_ENDPOINT' as keyof EnvConfig);
  const region = configService.get<string>('AWS_REGION' as keyof EnvConfig) ?? 'us-east-1';

  const client = new SecretsManagerClient({
    region,
    // Under Floci (endpoint set) use dummy creds; under real AWS leave the default provider
    // chain untouched (IAM role picked up by the SDK).
    ...(endpoint
      ? { endpoint, credentials: { accessKeyId: 'test', secretAccessKey: 'test' } }
      : {}),
  });

  const { SecretString } = await client.send(new GetSecretValueCommand({ SecretId: secretId }));
  if (!SecretString) {
    return;
  }

  // Terraform seeds this secret as a single flat JSON object of string values (see
  // infra/floci/secrets.tf). We fail loudly on any deviation (bad JSON, non-object, non-string
  // values) rather than silently ignoring — a malformed secret would otherwise leave the app
  // running with a partial env and cause hard-to-debug failures downstream.
  let parsed: unknown;
  try {
    parsed = JSON.parse(SecretString);
  } catch (err) {
    throw new Error(
      `Secrets Manager blob "${secretId}" is not valid JSON: ${(err as Error).message}`,
    );
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`Secrets Manager blob "${secretId}" must be a flat JSON object`);
  }
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (typeof value !== 'string') {
      throw new Error(
        `Secrets Manager blob "${secretId}" key "${key}" must be a string, got ${typeof value}`,
      );
    }
    process.env[key] = value;
  }
}
