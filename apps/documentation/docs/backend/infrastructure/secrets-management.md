# Secrets Management — Secrets Manager Hydration Gate

Owner: backend
Last updated: 2026-09-23

## What it does

When `DEPLOYMENT_TARGET=aws`, a **single JSON blob** in AWS Secrets Manager is the source of
truth for every app secret and env-derived config value. Both the API (`src/main.ts`) and the
worker (`src/worker.main.ts`) fetch and unpack this blob **before** any Nest module is
`require()`'d — so downstream code reads secrets from `process.env` exactly like it does in
local development from `.env`.

Under `DEPLOYMENT_TARGET=local`, the hydration step is a no-op — `.env` remains the source.

## Why a pre-Nest gate?

`app.module.ts` constructs a `new ConfigService()` at module-**evaluation** time (before Nest
DI even runs), which reads `process.env` synchronously. If Secrets Manager hydration happened
later — e.g. in an `onModuleInit` lifecycle hook — `ConfigService` would already have been
built with the pre-hydration env and every downstream `.get()` would return stale values.

The fix is CommonJS-native: use dynamic `import()` to defer the `require('./bootstrap')` until
after the async hydration finishes.

## The three-file structure

```
src/main.ts                     ← entry point; loads .env, hydrates secrets, dynamic-imports bootstrap
src/config/secrets-bootstrap.ts ← hydrateSecretsIfNeeded() — fetches SM blob, writes process.env
src/config/deployment-target.util.ts ← createStandaloneConfigService(), isAwsDeploymentTarget()
src/bootstrap.ts                ← the actual Nest AppModule bootstrap (was inline in main.ts before)
```

Same shape on the worker side (`worker.main.ts` / `worker-bootstrap.ts`).

## Boot sequence (DEPLOYMENT_TARGET=aws)

```
1. Node process starts
2. main.ts: loadDotenv()                       ← process.env has DEPLOYMENT_TARGET + FLOCI_ENDPOINT
3. main.ts: dynamic import secrets-bootstrap
4. hydrateSecretsIfNeeded()
   ├─ createStandaloneConfigService() (reads process.env directly)
   ├─ if DEPLOYMENT_TARGET !== 'aws' → return (no-op)
   ├─ SecretsManagerClient.send(GetSecretValueCommand)
   ├─ JSON.parse(SecretString)  (fails LOUD on bad JSON)
   └─ for each key/value in the blob → process.env[key] = value
5. main.ts: dynamic import ./bootstrap
6. bootstrap.ts: NestFactory.create(AppModule)
   └─ AppModule imports EnvConfigModule which builds ConfigService — reads HYDRATED process.env
```

## The Secrets Manager blob shape

**One flat JSON object** of string→string. Any nesting or non-string values throw at hydration
time (fail loud is safer than a half-populated env).

```json
{
  "DEPLOYMENT_TARGET": "aws",
  "FLOCI_ENDPOINT": "http://localhost:4566",
  "AWS_REGION": "us-east-1",
  "MEDIA_S3_BUCKET": "maintinee-media-source-development",
  "MEDIA_OUTPUT_BUCKET": "maintinee-media-output-development",
  "MEDIA_STORAGE_DRIVER": "s3",
  "MEDIA_TRANSCODER": "lambda",
  "MEDIA_TRANSCODER_LAMBDA_NAME": "maintinee-ffmpeg-transcoder-development",
  "MEDIA_SOURCE_EVENTS_QUEUE_URL": "http://localhost:4566/000000000000/media-source-events",
  "JWT_SECRET": "…",
  "GOOGLE_CLIENT_SECRET": "…"
}
```

Under Floci, `infra/floci/secrets.tf` seeds this automatically — the `secret_blob` local
merges three sources:

1. **`local.computed_secrets`** — values Terraform already knows (bucket names, region, driver
   selection, Lambda function name)
2. **`local.queue_url_secrets`** — one `*_QUEUE_URL` per queue, derived from Terraform SQS
   outputs
3. **`var.app_secrets`** — opaque values with no Terraform counterpart (JWT keys, OAuth
   creds, third-party API keys) — populated from `terraform.tfvars` (gitignored)

## Adding a new secret

**For local dev (Floci):**

1. Copy `infra/floci/terraform.tfvars.example` to `infra/floci/terraform.tfvars`
   (`.gitignore`d)
2. Add your key under `app_secrets = { ... }`
3. `pnpm infra:floci:apply` — Terraform updates the Secrets Manager version
4. Restart the app — the hydration step picks up the new value

**For prod (real AWS):**

Depends on your ops process. Typical pattern: CI pipeline runs `terraform apply` against
production tfstate with `app_secrets` sourced from your secrets store (Vault, SSM Parameter
Store, etc.) — never plaintext in git.

## Naming convention

`SECRETS_MANAGER_SECRET_ID` env var picks the blob. Defaults to `maintinee/<NODE_ENV>`, e.g.:

- `maintinee/development` — local Floci
- `maintinee/staging` — stage AWS
- `maintinee/production` — prod AWS

Override with `SECRETS_MANAGER_SECRET_ID` if your deployment uses a different name.

## Validation & error modes

`hydrateSecretsIfNeeded()` throws (and the process exits non-zero) on:

- Secret does not exist → `ResourceNotFoundException`
- Secret exists but `SecretString` is empty → silently returns (nothing to hydrate)
- `SecretString` is not valid JSON → `Error: Secrets Manager blob "…" is not valid JSON: …`
- Parsed JSON is not a flat object (array, string, null) → `Error: …must be a flat JSON object`
- Any value in the blob is not a string → `Error: …key "X" must be a string, got number`

All of these fail LOUD — the app never starts with a partially-hydrated env.

## Testing hydration works

```bash
# 1. Ensure Floci is up + a secret is seeded
aws --endpoint-url=http://localhost:4566 secretsmanager get-secret-value \
  --secret-id maintinee/development

# 2. Force-aws-mode and boot the app — you should see the app pick up seeded values
DEPLOYMENT_TARGET=aws FLOCI_ENDPOINT=http://localhost:4566 pnpm start:dev
```

## What NEVER goes in the Secrets Manager blob

- **Anything that changes per-instance** — pod hostname, container ID
- **Prometheus/OTEL endpoint URLs** — those should come from the k3s service mesh, not
  Secrets Manager
- **The Secrets Manager credentials themselves** — chicken/egg; they come from the pod's IAM
  role

## Rotation

Value rotation is a Secrets Manager feature; the app has no rotation code. To rotate a JWT
signing key:

1. Update the value in Terraform / SM
2. Trigger a rolling restart of the API + worker deployments (they only read the blob at
   boot)
3. Because the app doesn't support **multiple** signing keys in-flight, expect a brief window
   where JWTs signed with the old key are rejected. If you need zero-downtime rotation,
   introduce a `JWT_SECRETS` list-of-keys field first.
