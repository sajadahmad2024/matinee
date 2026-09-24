# Deployment Target — `local` vs `aws`

Owner: backend
Last updated: 2026-09-23

## What it does

`DEPLOYMENT_TARGET` is a single env variable that flips every AWS SDK client (S3, SQS,
Lambda, MediaConvert, SES, SNS, Secrets Manager) between:

| Value | AWS SDK client points at… | Credentials |
|---|---|---|
| `local` (default) | Whatever the per-service provider selects (local disk, ElasticMQ, SMTP, etc.) | N/A — most providers are non-AWS in local mode |
| `aws` **with** `FLOCI_ENDPOINT=http://localhost:4566` | **Floci** (LocalStack-compatible emulator) on your dev machine | Dummy `test`/`test` — Floci accepts anything |
| `aws` **without** `FLOCI_ENDPOINT` | **Real AWS** (production / staging) | Default AWS credential chain (IAM role, env vars, `~/.aws/credentials`) |

No code change ever touches this. Provider factories check `DEPLOYMENT_TARGET` at construction
time and route the SDK appropriately.

## The helpers

`src/common/helpers/aws-endpoint.util.ts` exports two functions used by every AWS SDK client
construction in the codebase:

```ts
getAwsEndpointOverride(configService)
// → 'http://localhost:4566' when DEPLOYMENT_TARGET=aws AND FLOCI_ENDPOINT is set
// → undefined otherwise (SDK resolves real AWS on its own)

getFlociCredentials(configService)
// → { accessKeyId: 'test', secretAccessKey: 'test' } when hitting Floci
// → undefined otherwise (SDK uses the default credential chain)
```

Every provider follows this exact pattern:

```ts
const endpoint = getAwsEndpointOverride(config);
const credentials = getFlociCredentials(config);
this.client = new S3Client({
  region,
  ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
  ...(credentials ? { credentials } : {}),
});
```

## Providers wired to the helpers

| Provider | File | Notes |
|---|---|---|
| S3 storage | `src/media/providers/s3-storage.provider.ts` | Legacy `MEDIA_S3_ENDPOINT` still respected for MinIO users |
| SQS queue driver | `src/queue/drivers/sqs.driver.ts` | Legacy `SQS_ENDPOINT` still respected for ElasticMQ users |
| Lambda transcoder | `src/media/providers/lambda-transcoder.provider.ts` | New in v1 pipeline |
| SES email | `src/email/providers/ses.provider.ts` | |
| SNS SMS | `src/sms/providers/sns.provider.ts` | |
| Secrets Manager (pre-boot) | `src/config/secrets-bootstrap.ts` | Uses same env pattern, direct SDK client (no Nest DI yet) |

## Precedence — which endpoint wins?

The S3 + SQS providers preserve legacy per-service env vars (`MEDIA_S3_ENDPOINT`, `SQS_ENDPOINT`)
so an existing MinIO / ElasticMQ setup keeps working:

```
1. Explicit per-service endpoint (MEDIA_S3_ENDPOINT / SQS_ENDPOINT)  ← wins if set
2. FLOCI_ENDPOINT (via getAwsEndpointOverride)                        ← if DEPLOYMENT_TARGET=aws
3. undefined (SDK default resolution to real AWS)
```

Newer providers (Lambda, Secrets Manager) skip step 1 — there was no legacy override to
preserve.

## When you deploy to real AWS

Set exactly two things in your prod env:

```
DEPLOYMENT_TARGET=aws
# FLOCI_ENDPOINT deliberately unset — SDK falls through to real AWS
```

Everything else (bucket names, queue URLs, IAM role, region) either lives in
`SECRETS_MANAGER_SECRET_ID` (see [secrets-management.md](./secrets-management.md)) or the pod
env.

## Common gotchas

- **Setting `DEPLOYMENT_TARGET=aws` without seeding Secrets Manager** → `secrets-bootstrap.ts`
  throws `ResourceNotFoundException` at boot. This is intentional — fail loud beats running
  with a partial config. Either seed the secret (via terraform locally, or CI in prod) or
  leave `DEPLOYMENT_TARGET=local`.
- **Forgetting `forcePathStyle: true` for Floci** → the S3 SDK defaults to virtual-hosted
  style (`https://<bucket>.<endpoint>`), which Floci can't route. `getAwsEndpointOverride`
  callers all include `forcePathStyle: true` when the endpoint is set.
- **Legacy env survives** — `MEDIA_S3_ENDPOINT` and `SQS_ENDPOINT` still work. If you switch
  a dev to `DEPLOYMENT_TARGET=aws` but forget to clear these, they'll silently override Floci
  and hit whatever those envs point at.

## Testing that the switch works

Standalone smoke against Floci:

```bash
# 1. Floci running
docker ps --filter name=floci

# 2. Bucket seeded
aws --endpoint-url=http://localhost:4566 s3 ls

# 3. Point the app at Floci
export DEPLOYMENT_TARGET=aws FLOCI_ENDPOINT=http://localhost:4566
export AWS_REGION=us-east-1 MEDIA_S3_BUCKET=maintinee-media-source-development

pnpm start:dev
# → the API log line "Initializing media storage provider: s3" plus a successful
#    presigned-URL request confirms the switch
```
