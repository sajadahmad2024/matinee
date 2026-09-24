# Infrastructure — Documentation Index

Cross-cutting docs that aren't tied to any single module.

## Docs

- **[deployment-target.md](./deployment-target.md)** — `DEPLOYMENT_TARGET=local|aws`
  env-driven switch that routes every AWS SDK client between Floci (local emulator) and
  real AWS in prod, without a single code change. The core primitive the video pipeline is
  built on.
- **[secrets-management.md](./secrets-management.md)** — pre-Nest-boot hydration of AWS
  Secrets Manager into `process.env`, so `ConfigService.get(...)` works uniformly across
  local (`.env`) and prod (Secrets Manager) — again, no code change.

## Related

- **[../media/floci-local-aws.md](../media/floci-local-aws.md)** — Floci setup / Terraform
  usage (uses both primitives above)
