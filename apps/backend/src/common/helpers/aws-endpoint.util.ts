/**
 * Minimal duck-typed contract — accepts NestJS `ConfigService` whether it's typed with
 * `EnvConfig`, `any`, or untyped. Uses a permissive key type (`any`) so both the typed
 * `ConfigService<EnvConfig>` (whose `get()` demands `keyof EnvConfig`) and the untyped
 * `ConfigService` (whose `get()` accepts `string`) both satisfy this contract without any
 * re-cast at the call site.
 */
interface ConfigServiceLike {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get: <T = string>(key: any) => T | undefined;
}

/**
 * Shared by every AWS SDK client construction (S3, SQS, Lambda, MediaConvert, SES, SNS) so
 * pointing at Floci (localstack-compatible) instead of real AWS is a one-line addition per
 * provider rather than duplicated env-var logic. Returns `undefined` outside
 * `DEPLOYMENT_TARGET=aws`, which leaves the AWS SDK's default endpoint resolution (real AWS)
 * untouched.
 */
export function getAwsEndpointOverride(configService: ConfigServiceLike): string | undefined {
  if (configService.get<string>('DEPLOYMENT_TARGET') !== 'aws') {
    return undefined;
  }
  const endpoint = configService.get<string>('FLOCI_ENDPOINT');
  return endpoint && endpoint.length > 0 ? endpoint : undefined;
}

/**
 * Floci accepts any credentials, but the AWS SDK v3's default credential provider chain still
 * throws `CredentialsProviderError` if none are configured (env vars, shared config, IMDS, etc.)
 * — so every client construction needs an explicit static-credentials fallback while pointed at
 * Floci. Returns `undefined` outside `DEPLOYMENT_TARGET=aws` (leaves default chain untouched)
 * and outside Floci mode (`FLOCI_ENDPOINT` empty → real AWS creds via default chain).
 */
export function getFlociCredentials(
  configService: ConfigServiceLike,
): { accessKeyId: string; secretAccessKey: string } | undefined {
  return getAwsEndpointOverride(configService)
    ? { accessKeyId: 'test', secretAccessKey: 'test' }
    : undefined;
}
