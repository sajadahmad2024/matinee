# Build context MUST be the monorepo root:
#   docker build -f apps/backend/Dockerfile .
#
# One image, three roles (override CMD per ECS task definition):
#   API     (default)  node dist/main.js
#   Worker             node dist/worker.main.js
#   Migrate (one-off)  node dist/db/drizzle/migrate.js

# ---------- BUILD ----------
FROM node:22.22.1-alpine AS build

RUN corepack enable && \
    corepack prepare pnpm@10.15.0 --activate

# Toolchain for native addons (e.g. bcrypt) on musl/alpine
RUN apk add --no-cache python3 make g++

# Skip Chromium download in postinstall — browser binary isn't in node_modules so it won't carry to production
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

WORKDIR /app

# Copy workspace metadata (for Docker caching: avoids reinstall on source changes)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .pnpmrc ./

# Copy package manifests so pnpm can resolve workspace dependencies.
# All workspace importers must be present for --frozen-lockfile to match the lockfile.
COPY apps/backend/package.json ./apps/backend/
COPY apps/web/package.json ./apps/web/
COPY apps/documentation/package.json ./apps/documentation/

# Install backend dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile --filter "backend..."

# Copy backend source
COPY apps/backend ./apps/backend

# Build API (nest build + copy:assets)
RUN pnpm --filter backend run build:api

# ---------- PRODUCTION ----------
FROM node:22.22.1-alpine AS production

# Runtime lib needed by native addons compiled in the build stage
RUN apk add --no-cache openssl libstdc++

WORKDIR /app/apps/backend

ENV NODE_ENV=production
ENV PORT=3000
# Plain-text logs: Nest's console colors render as raw ANSI escape codes ("[95m…[39m") in
# CloudWatch, making container logs unreadable. NO_COLOR is respected by Nest's logger.
ENV NO_COLOR=1

# Secrets Manager: with DEPLOYMENT_TARGET=aws, src/config/secrets-bootstrap.ts fetches the JSON
# secret SECRETS_MANAGER_SECRET_ID (default maintinee/<NODE_ENV>) at boot and copies every key
# into process.env before Nest starts. Credentials come from the ECS task role.
# Set SECRETS_MANAGER_SECRET_ID and AWS_REGION in the task definition.
ENV DEPLOYMENT_TARGET=aws

# Copy root node_modules (contains .pnpm virtual store)
COPY --chown=node:node --from=build /app/node_modules /app/node_modules

# Copy backend's node_modules (symlinks to .pnpm store for dependency resolution)
COPY --chown=node:node --from=build /app/apps/backend/node_modules ./node_modules

# Copy compiled output
COPY --chown=node:node --from=build /app/apps/backend/dist ./dist

# Runtime assets
COPY --chown=node:node --from=build /app/apps/backend/views ./views
COPY --chown=node:node --from=build /app/apps/backend/assets ./assets

# Drizzle migrations
COPY --chown=node:node --from=build /app/apps/backend/src/db/drizzle/migrations ./src/db/drizzle/migrations

# Runtime-writable paths used by Winston and static asset bootstrap
RUN mkdir -p /app/apps/backend/logs && chown -R node:node /app

USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]
