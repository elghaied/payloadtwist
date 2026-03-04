FROM node:22-slim AS base

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

# Auth DB needs a dummy value at build time
ENV AUTH_DATABASE_URL=postgresql://localhost:5432/placeholder
ENV BETTER_AUTH_SECRET=build-time-secret-placeholder-minimum-32chars

RUN corepack enable pnpm && pnpm run build --filter=@payloadtwist/web

# --- Production ---
FROM base AS runner
WORKDIR /app

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
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/drizzle ./drizzle

USER nextjs

EXPOSE 3000
ENV PORT=3000

CMD ["node", "apps/web/server.js"]
