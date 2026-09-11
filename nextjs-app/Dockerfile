FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
RUN apk add --no-cache --no-check-certificate python3 build-base && corepack enable && corepack prepare pnpm@9.15.4 --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p public
ARG BACKEND_API_URL
ENV BACKEND_API_URL=$BACKEND_API_URL
# ─── Database Migration (SQLite) ─────────────────────────────────────────────
# Run migration at build time so DB exists for Next.js static generation.
RUN npx tsx scripts/migrate.ts
# ─────────────────────────────────────────────────────────────────────────────
RUN pnpm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# Copy pre-built SQLite database to initial location (for volume initialization)
COPY --from=builder /app/db ./db-initial
# Copy scripts for runtime migrations
COPY --from=builder /app/scripts ./scripts
# Copy entrypoint script for runtime RESET_DB
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/docker-entrypoint.sh"]