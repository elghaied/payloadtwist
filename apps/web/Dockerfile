FROM node:24-trixie-slim AS base

# --- Prune workspace for web app ---
FROM base AS pruner
WORKDIR /app
RUN corepack enable pnpm && npm install -g turbo@^2
COPY . .
RUN turbo prune @payloadtwist/web --docker

# --- Install dependencies from pruned lockfile ---
FROM base AS deps
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# --- Build ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/ .
COPY --from=pruner /app/out/full/ .

ENV NEXT_TELEMETRY_DISABLED=1

ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY=
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY

RUN --mount=type=secret,id=AUTH_DATABASE_URL \
    --mount=type=secret,id=BETTER_AUTH_SECRET \
    export AUTH_DATABASE_URL=$(cat /run/secrets/AUTH_DATABASE_URL) && \
    export BETTER_AUTH_SECRET=$(cat /run/secrets/BETTER_AUTH_SECRET) && \
    corepack enable pnpm && pnpm run build --filter=@payloadtwist/web

# --- Production ---
FROM base AS runner
WORKDIR /app

# Patch OS packages and drop the package managers bundled in the Node image: the standalone
# server never needs them, and their vendored deps (tar, glob, sigstore, ...) carry CVEs.
RUN apt-get update && apt-get upgrade -y --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /usr/local/lib/node_modules /opt/yarn-* \
       /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack /usr/local/bin/yarn /usr/local/bin/yarnpkg

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public

# Standalone output
RUN mkdir -p apps/web/.next
RUN chown nextjs:nodejs apps/web/.next
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

# Drizzle migrations for auth DB (PostgreSQL)
# process.cwd() in standalone mode is /app/apps/web/
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/drizzle ./apps/web/drizzle

USER nextjs

EXPOSE 3000
ENV PORT=3000
# Bind all interfaces: Docker sets HOSTNAME to the container id, which breaks localhost healthchecks.
ENV HOSTNAME=0.0.0.0

CMD ["node", "apps/web/server.js"]
