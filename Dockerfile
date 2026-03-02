FROM node:22-alpine AS base

# --- Install dependencies ---
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# --- Build ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Payload needs these at build time — provide dummy values
ENV DATABASE_URL=file:./payloadtwist.db
ENV PAYLOAD_SECRET=build-time-secret-placeholder
ENV AUTH_DATABASE_URL=postgresql://localhost:5432/placeholder
ENV BETTER_AUTH_SECRET=build-time-secret-placeholder

RUN corepack enable pnpm && pnpm run build

# --- Production ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Standalone output
RUN mkdir .next
RUN chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Writable directory for SQLite database
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data
ENV DATABASE_URL=file:./data/payloadtwist.db

USER nextjs

EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
