# syntax=docker/dockerfile:1
# Build context MUST be the monorepo root:
#   docker build -f apps/web/Dockerfile .
# so pnpm can see the root workspace + lockfile.

ARG NODE_VERSION=20-alpine

# ---- base: shared pnpm setup ----
FROM node:${NODE_VERSION} AS base
RUN apk add --no-cache libc6-compat && corepack enable
WORKDIR /repo

# ---- deps: install only what `web` needs, cached on manifests ----
FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
# Every workspace manifest must be present for --frozen-lockfile to match the
# lockfile's importers, even though only `web` (and its deps) gets installed.
COPY apps/web/package.json apps/web/package.json
COPY apps/backend/package.json apps/backend/package.json
COPY apps/documentation/package.json apps/documentation/package.json
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --filter "web..."

# ---- builder: compile the Next.js app ----
FROM deps AS builder
# node_modules is excluded by .dockerignore, so this won't clobber the install.
COPY . .

# NEXT_PUBLIC_* values are inlined into the client bundle at build time.
# ARGs are visible as env vars to RUN steps in this stage. Server-only
# secrets are NOT build args — pass them at container start instead.
ARG NEXT_PUBLIC_APP_ENV=production
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_APP_DESCRIPTION
ARG NEXT_PUBLIC_APP_CATEGORY
ARG NEXT_PUBLIC_APP_KEYWORDS
ARG NEXT_PUBLIC_GTM_KEY
ARG NEXT_PUBLIC_POSTHOG_KEY
ARG NEXT_PUBLIC_POSTHOG_HOST
ARG NEXT_PUBLIC_POSTHOG_INGEST
ARG NEXT_PUBLIC_POSTHOG_ENVIRONMENT
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

# Enable Next.js standalone output for the image without changing app code.
# No-op once next.config.ts sets it; fails loudly if the patch can't apply.
RUN node -e "const fs=require('fs'),f='apps/web/next.config.ts';let s=fs.readFileSync(f,'utf8');if(!/output:\s*['\"]standalone/.test(s)){const t=s.replace(/const nextConfig: NextConfig = \{/,'\$&\n  output: \"standalone\",');if(t===s){console.error('Could not inject output: standalone into '+f);process.exit(1)}fs.writeFileSync(f,t)}"

# Unset any NEXT_PUBLIC_* left empty so t3-env (env.ts) falls back to its
# defaults instead of failing validation on "" (e.g. z.url()).
RUN --mount=type=cache,id=web-next-cache,target=/repo/apps/web/.next/cache \
    for v in $(env | sed -n 's/^\(NEXT_PUBLIC_[A-Z_]*\)=$/\1/p'); do unset "$v"; done; \
    pnpm --filter web build

# ---- runner: minimal production image ----
FROM node:${NODE_VERSION} AS runner
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3002 \
    HOSTNAME=0.0.0.0

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# `output: "standalone"` (injected in the builder stage) traces only runtime files. With
# outputFileTracingRoot at the repo root, the server lands at apps/web/server.js.
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3002

CMD ["node", "apps/web/server.js"]
